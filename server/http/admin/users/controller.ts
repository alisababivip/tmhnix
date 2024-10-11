import { handleController } from '~~/utils'
import {
  deleteUser,
  deleteUsers,
  getAllUsers,
  getUser,
  getUserCountsPerDay,
  getUsers,
  updateUser,
  updateUsersStatus,
} from './queries'

export const controllers = {
  index: handleController(async (_, __, ___, query) => {
    const { filter, perPage, page } = query
    const perPageNumber = perPage ? parseInt(perPage, 10) : 10
    const pageNumber = page ? parseInt(page, 10) : 1
    return await getUsers(filter, perPageNumber, pageNumber)
  }),
  fetch: handleController(async () => {
    return await getAllUsers()
  }),

  show: handleController(async (_, __, params) => {
    return getUser(params.uuid)
  }),
  update: handleController(async (_, __, params, ___, body, user) => {
    try {
      const { uuid } = params
      const { first_name, last_name, email, role_id } = body
      const response = await updateUser(
        uuid,
        user.id,
        first_name,
        last_name,
        email,
        Number(role_id),
      )
      return {
        ...response,
        message: 'User updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  delete: handleController(async (_, __, params) => {
    try {
      await deleteUser(params.uuid)
      return {
        message: 'User removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  deleteBulk: handleController(async (_, __, ___, ____, body) => {
    try {
      await deleteUsers(body.users)
      return {
        message: 'Users removed successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),
  updateStatus: handleController(async (_, __, ___, ____, body) => {
    try {
      await updateUsersStatus(body.users, body.status)
      return {
        message: 'Users updated successfully',
      }
    } catch (error) {
      throw new Error(error.message)
    }
  }),

  analytics: handleController(async () => {
    return await getUserCountsPerDay()
  }),
}
