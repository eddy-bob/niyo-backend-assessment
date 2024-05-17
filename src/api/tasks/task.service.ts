import {
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SuccessResponse } from 'src/utils/response';
import { Status } from 'src/types/task';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskAsAdminDto } from './dto/update-task-as-admin.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private userService: UsersService,
  ) {}

  /**
   * This method creates a new task
   * @param {CreateTaskDto} payload -the payload containing the details of the new task to be created
   * @param {string} payload.title - The title of the task to be created
   * @param {string} payload.description - The description of the task to be created
   * @param {string} payload.user - The user ID of the user to whom the new task is to be assigned to. This is an optional field   *
   * @returns {Promise<Task>} - The response containing the newly created Task .
   */
  async createTask(payload: CreateTaskDto) {
    // destructure the payload
    const { user, description, title } = payload;

    // search for a user with the provided user id in the payload and throw an 404 error if not found
    const userObj = await this.userService.findOneProfile(user);

    // create a new task assigned to the provided user if available
    if (user) {
      const task = this.taskRepository.create({
        user: userObj,
        description,
        title,
      });

      // return the newly created task not assigned to a user
      return await this.taskRepository.save(task);
    }

    // create a new task without the user
    const task = this.taskRepository.create({
      description,
      title,
    });

    // return the newly created task already assigned to a user
    return await this.taskRepository.save(task);
  }

  /**
   * This method assigns and reassigns a task task to a user
   * @param {string} userId - ID  of the user to whom the task is to be assigned to
   * @param {string}  taskId - ID of the task to be assigned
   * @returns {Promise<SUccessResponse>}  The response containing the found assigned task and the success response message
   */
  async assignTask(userId: string, taskId: string) {
    // Find a user to assign the task to with the provided user id and throw a not found exception if user does not exist
    const user = await this.userService.findOne(userId);

    // Find a task with the provided task id
    const task = await this.findOne(taskId);

    // update the task with the provided user profile
    const updatedTask = task.data as Task;
    updatedTask.user = user.data as User;

    // save the updated Task to db
    await this.taskRepository.save(updatedTask);

    return new SuccessResponse(
      updatedTask,
      'Task (re)assigned to provided user.',
    );
  }

  /**
   * A method that fetchs all the tasks assigned to the logged in user
   * @param {User} user -The User database instance of the logged in user. this is optional.
   * @param  {string} status - The status of the task eg Pending,Completed etc
   * @param {Object} pagination - An object containing the pagination details
   * @param {string} pagination.page - This is the current page the user is on
   * @param {string} pagination.limit - This is the maximum number of tasks allowed to be fetched at a time. the default  is 10
   * @param {string} pagination.route - This is the url of the current page being loaded

   * @returns {Promise<Pagination<Task>>} - The fetched tasks paginated
   */
  async fetchMyTasks(
    user: User,
    status?: Status,
    pagination?: IPaginationOptions,
  ) {
    // destructure the pagination body
    const { limit, route, page } = pagination;
    // create a query builder to fetch all the tasks assigned to a user using its id

    const tasks = this.taskRepository.createQueryBuilder('task');
    tasks
      .leftJoin('task.user', 'user')
      .where('task.user.id =:id', { id: user.id });

    // if status is available as query, fetch the tasks applying the provided query
    if (status) {
      tasks.andWhere('task.status:=status', { status });
    }
    // order in decending order
    tasks.orderBy('task.created_at', 'DESC');
    return paginate<Task>(tasks, { limit, page, route });
  }

  /**
   * This method fetches a single task using the provided user id
   * @param {string} taskId - This is the ID of the task being queried for
   * @returns {Promise<SuccessResponse>}  The response containing the found task and the success response message
   */
  async findOne(taskId: string) {
    // find a task with the provided task id
    const singleTask = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    // throw a not found error if task  with provided id does not exist
    if (!singleTask) {
      throw new NotFoundException(
        `Task with provided id ${taskId} does not exist or deleted`,
      );
    }

    return new SuccessResponse(singleTask, 'Task successfully retrieved');
  }

  /**
   * A method that updates the status of a task
   * @param {string} taskId -The ID of the task to be updated.
   * @param  {UpdateTaskDto} payload - The payload containing the status to update the task to
   * @param {string} payload.status - The status to update the task to. this is an enum containing PENDING,COMPLETED AND IN-PROGRESS
   * @returns {Promise<SuccessResponse>} - The response containing the updated task and the success message
   */
  async updateTaskStatus(taskId: string, payload: UpdateTaskDto) {
    // find a task with the provided task id
    const task = await this.findOne(taskId);

    let updatedTask = task.data as Task;

    // update the task with the status provided as a param and save it to the database
    updatedTask.status = payload.status;
    updatedTask = await this.taskRepository.save(updatedTask);

    return new SuccessResponse(updatedTask, 'Task status updated successfully');
  }

  /**
   * This method updates a task
   * @param {CreateTaskDto} payload -the payload containing the details the task is to be updated to
   * @param {string} payload.title - The title of the task to be updated to. This is optional.
   * @param {string} payload.comment- The new comment on the task . This is optional.
   * @param {string} payload.description - The description  the task is to be updated to. this is optional
   * @param {string} payload.user - The ID of the user to whom the task  is to be reassigned to. This is an optional field
   * @returns {Promise<SuccessResponse>} - The response containing the updated task and the success message
   */
  async updateTask(taskId: string, payload: UpdateTaskAsAdminDto) {
    // find a task with the provided task id and throw a Not Found exception when it isnt found
    const task = await this.findOne(taskId);

    // Check if user provided in payload exists
    if (payload.user) {
      const user = await this.userService.findOneProfile(payload.user);
      // update the task with new information provided as a param and save it to the database
      await this.taskRepository.update(taskId, {
        ...payload,
        user,
      });
    }

    // update the task with the payload provided as a param and save it to the database
    const { user, ...results } = payload;
    await this.taskRepository.update(taskId, { ...results });

    return new SuccessResponse(payload, 'Task status updated successfully');
  }

  /**
   * This method queries the Task db for all created tasks using the provided query(s)
   * @param { Object} query - This is the query with which the task database entity is to be searched by. This is optional
   * @returns {Promise<Pagination<Task>>} - The fetched tasks paginated
   */
  async findAll(
    query?: { user: string; status: string },
    pagination?: IPaginationOptions,
  ) {
    // destructure query object
    const { status, user } = query;

    // destructure the pagination body
    const { limit, route, page } = pagination;
    // create a query builder to fetch all the tasks assigned to a user using its id

    const tasks = this.taskRepository.createQueryBuilder('task');
    tasks
      .leftJoin('task.user', 'user')
      .addSelect(['user.id', 'user.email', 'user.firstName', 'user.lastName']);

    // if user is available as query, fetch the tasks applying the provided user query
    if (user) {
      tasks.where('task.user.id =:id', { id: user });
    }
    // if status is available as query, fetch the tasks applying the provided status query
    if (status) {
      tasks.andWhere('task.status:=status', { status });
    }
    // order in decending order
    tasks.orderBy('task.created_at', 'DESC');
    return paginate<Task>(tasks, { limit, page, route });
  }

  /**
   * This deletes a task from the database using the provided ID
   * @param {string} id - This is the ID of the task to be deleted
   * @returns {Promise<SuccessResponse>} The response containing success response message and an empty data object
   */
  async removeTask(id: string) {
    //  find task with the provided  id and throw a not found exception if task with id does not exist
    await this.findOne(id);

    // delete task with provided id from database
    await this.taskRepository.delete(id);

    // return an empty data object with a success message
    return new SuccessResponse(
      {},
      `Task with provided id ${id} deleted successfully`,
    );
  }
}
