import { Router } from 'express';
import { DataController } from '../controller/data.controller';
import { dataValidation } from '../middleware/validator/data.validation';
import { dataUpdateValidation } from '../middleware/validator/dataUpdate.validation';

export class DataRouter {
  private router: Router;
  private dataController: DataController;

  constructor() {
    this.dataController = new DataController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * @swagger
     * /api/data/new-user:
     *   post:
     *     summary: Create a new user
     *     description: Creates a new user with the provided details.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *                 example: John
     *               lastName:
     *                 type: string
     *                 example: Doe
     *               position:
     *                 type: string
     *                 example: Developer
     *               phone:
     *                 type: string
     *                 example: "123-456-7890"
     *               email:
     *                 type: string
     *                 example: john.doe@example.com
     *     responses:
     *       200:
     *         description: User created successfully
     *       400:
     *         description: Validation error
     *       500:
     *         description: Internal server error
     */
    this.router.post(
      '/new-user',
      dataValidation,
      this.dataController.createData,
    );

    /**
     * @swagger
     * /api/data/users:
     *   get:
     *     summary: Get all users
     *     description: Retrieves a list of all users.
     *     responses:
     *       200:
     *         description: Successfully retrieved users
     *       500:
     *         description: Internal server error
     */
    this.router.get('/users', this.dataController.getData);

    /**
     * @swagger
     * /api/data/users:
     *   patch:
     *     summary: Update multiple users
     *     description: Updates user details for multiple users.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                   example: "1"
     *                 firstName:
     *                   type: string
     *                   example: Jane
     *                 lastName:
     *                   type: string
     *                   example: Doe
     *                 position:
     *                   type: string
     *                   example: Designer
     *                 phone:
     *                   type: string
     *                   example: "987-654-3210"
     *                 email:
     *                   type: string
     *                   example: jane.doe@example.com
     *     responses:
     *       200:
     *         description: Users updated successfully
     *       400:
     *         description: Validation error or user ID not found
     *       500:
     *         description: Internal server error
     */
    this.router.patch(
      '/users',
      dataUpdateValidation,
      this.dataController.updateData,
    );

    /**
     * @swagger
     * /api/data/paginate:
     *   get:
     *     summary: Paginate users
     *     description: Retrieves a paginated list of users.
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         required: false
     *         description: The page number to retrieve
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         required: false
     *         description: The number of users to retrieve per page
     *     responses:
     *       200:
     *         description: Successfully retrieved paginated users
     *       500:
     *         description: Internal server error
     */
    this.router.get('/paginate', this.dataController.paginateData);
  }

  getRouter(): Router {
    return this.router;
  }
}
