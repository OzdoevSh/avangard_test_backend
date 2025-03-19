import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class GenerateUserAndTasksTables1742337740753 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "task" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "status" VARCHAR(50) DEFAULT 'new',
        "deadline" TIMESTAMP NOT NULL,
        "userId" INTEGER,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_TASK_USER" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.createIndex(
      'task',
      new TableIndex({
        name: 'IDX_TASK_TITLE',
        columnNames: ['title'],
      }),
    );

    await queryRunner.createIndex(
      'task',
      new TableIndex({
        name: 'IDX_TASK_DESCRIPTION',
        columnNames: ['description'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "task"');
    await queryRunner.query('DROP TABLE "user"');
  }
}