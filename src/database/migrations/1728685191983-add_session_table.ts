import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionTable1728685191983 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "session" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL
        ) WITH (OIDS=FALSE);
        
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        
        CREATE INDEX "IDX_session_expire" ON "session" ("expire");
        `);
  }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        DROP INDEX "IDX_session_expire";
        DROP TABLE "session";
      `);
  }
}
