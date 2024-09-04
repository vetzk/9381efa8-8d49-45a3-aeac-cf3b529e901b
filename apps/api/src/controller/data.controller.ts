import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";

export class DataController {
  async createData(req: Request, res: Response, next: NextFunction) {
    const { firstName, lastName, position, phone, email } = req.body;
    try {
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          position,
          phone,
          email,
        },
      });
      return res.status(200).send({
        success: true,
        message: "Create user success",
        result: user,
      });
    } catch (error) {
      console.error(error);
      return next({
        success: false,
        message: "Cannot create your data",
        error,
      });
    }
  }

  async getData(req: Request, res: Response, next: NextFunction) {
    try {
      const allUser = await prisma.user.findMany();
      return res.status(200).send({
        success: true,
        message: "Get all user success",
        result: allUser,
      });
    } catch (error) {
      console.error(error);
      return next({
        success: false,
        message: "Cannot get users data",
        error,
      });
    }
  }

  async updateData(req: Request, res: Response, next: NextFunction) {
    const users = req.body; // Expecting an array of user objects
    console.log(users.map((e: any) => e.email));
    try {
      // Ensure the users array is valid
      if (!Array.isArray(users)) {
        return res.status(400).send({
          success: false,
          message: "Invalid data format",
        });
      }

      const updatePromises = users.map(async (user: any) => {
        const { id, firstName, lastName, position, phone, email } = user;

        if (!id) {
          // Handle the case where ID is not provided
          return res.status(400).send({
            success: false,
            message: "User ID is required",
          });
        }

        // Find the user
        const findUser = await prisma.user.findUnique({ where: { id } });
        if (!findUser) {
          return { success: false, message: `User with ID ${id} not found` };
        }

        // Update the user
        return prisma.user.update({
          data: { firstName, lastName, position, phone, email },
          where: { id },
        });
      });

      // Execute all updates
      const results = await Promise.all(updatePromises);

      // Filter out any unsuccessful updates

      return res.status(200).send({
        success: true,
        message: "Users updated successfully",
        result: results,
      });
    } catch (error: any) {
      console.error(error);
      return next({
        success: false,
        message: "Cannot update your data",
        error: error.message,
      });
    }
  }

  async paginateData(req: Request, res: Response, next: NextFunction) {
    const {
      page = 1,
      limit = 8,
      search,
      firstName,
      position,
      lastName,
      email,
    } = req.query;
    try {
      let searchResult = {};

      if (search) {
        searchResult = {
          OR: [
            { firstName: { contains: String(search) } },
            { lastName: { contains: String(search) } },
            { position: { contains: String(search) } },
            { email: { contains: String(search) } },
          ],
        };
      }
      const getUsers = await prisma.user.findMany({
        where: {
          ...searchResult,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      const totalUsers = await prisma.user.count({
        where: {
          ...searchResult,
        },
      });
      const totalPages = Math.ceil(totalUsers / Number(limit));
      return res.status(200).send({
        success: true,
        result: getUsers,
        total: totalUsers,
        totalPages,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error(error);
      return next({
        success: false,
        message: "Cannot fetch your data",
        error,
      });
    }
  }

  // async searchData(req: Request, res: Response, next: NextFunction) {
  //   const { query } = req.query; // Assuming query is sent as a query parameter

  //   try {
  //     // If no query is provided, return all users
  //     if (!query) {
  //       const allUsers = await prisma.user.findMany();
  //       return res.status(200).send({
  //         success: true,
  //         message: "Get all users success",
  //         result: allUsers,
  //       });
  //     }

  //     // Perform search
  //     const searchResults = await prisma.user.findMany({
  //       where: {
  //         OR: [
  //           { firstName: { contains: String(query) } },
  //           { lastName: { contains: String(query) } },
  //           { position: { contains: String(query) } },
  //         ],
  //       },
  //     });

  //     return res.status(200).send({
  //       success: true,
  //       message: "Search results fetched successfully",
  //       result: searchResults,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return next({
  //       success: false,
  //       message: "Cannot fetch search results",
  //       error,
  //     });
  //   }
  // }
}
