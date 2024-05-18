import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import configuration from './config/configuration';
import { ForbiddenException, Inject } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { User } from './api/users/entities/user.entity';
import { CREATE_TASK, SOCKET_CONNECT } from './constant';
import { JWT, CREATE_TASK_ERROR } from './constant';
import { Jwt } from './providers/jwt.provider';
import { TaskService } from './api/tasks/task.service';
import { CreateTaskDto } from './api/tasks/dto/create-task.dto';
import { Role } from './types/user';

// socket instance extended to include the user object
class ExtendedSocket extends Socket {
  user: User;
}
// load the configs on the app
const config = configuration();

@WebSocketGateway(parseInt(config.websocket.port, 10), {
  cors: {
    origin: [config.FrontEndUrl, config.appUrl],
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly taskService: TaskService,
    @Inject(JWT)
    private readonly jwtService: Jwt,
  ) {
    console.log('RannnnE');
  }

  // initialize the native websocket server and load it onto an variable 'server'
  @WebSocketServer() server: Server;

  private extractJwtFromHeader(client: ExtendedSocket) {
    // fetch  the authorization from the header which either exists as 'client.handshake.auth.headers'
    // or 'client.handshake.headers' depending on the version of socket io used on the client
    const headers =
      typeof client.handshake.auth.headers !== 'undefined'
        ? client.handshake.auth.headers
        : client.handshake.headers;
    const tke = headers.authorization && headers.authorization.split(' ')[1];
    return tke;
  }

  // subscribe to an event
  @SubscribeMessage(CREATE_TASK)
  async handleCreateTask(
    client: ExtendedSocket,
    payload: CreateTaskDto,
  ): Promise<void> {
    const tke = this.extractJwtFromHeader(client);
    try {
      if (!tke) {
        this.server.to(client.id).emit(CREATE_TASK_ERROR, {
          message: 'Unauthorized. Please sign in',
          status: 401,
        });
        return;
      }

      //verify the access token provided in the header
      const jwtRes = await this.jwtService.verifyToken(tke);

      // if user is not an admin, prevent access
      if (jwtRes.role === Role.USER) {
        throw new ForbiddenException();
      }
      // create new task
      const response = await this.taskService.createTask(payload);

      // emit a new event to the client with details of the new task created
      this.server.to(jwtRes.sub).emit(CREATE_TASK, response);
    } catch (error) {
      // emit an event to the client when somethig goes wrong like a failed jwt validation
      this.server.to(client.id).emit(CREATE_TASK_ERROR, {
        status: error.status || 500,
        message: error.message || 'Could not create task',
      });
    }
  }

  afterInit() {
    const dateString = new Date().toLocaleString();
    const message = `[WebSocket] ${process.pid} - ${dateString} LOG [WebSocketServer] Websocket server successfully started`;
    console.log(message);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
  }

  async handleConnection(client: ExtendedSocket, ...args: any[]) {
    try {
      const tke = this.extractJwtFromHeader(client);

      if (tke) {
        const payload = await this.jwtService.verifyToken(tke);
        // join private room with your id as the name and emit the event
        client.join(payload?.sub);
        this.server.to(payload.sub).emit(SOCKET_CONNECT, { connected: true });
        return;
      }
      // emit a message to the client informing them of a successful connection
      this.server.to(client.id).emit(SOCKET_CONNECT, { connected: true });
    } catch (error) {
      this.server.to(client.id).emit(SOCKET_CONNECT, error);
      client.disconnect(true);
    }
  }
}
