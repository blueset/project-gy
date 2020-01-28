import { Sequelize } from "sequelize-typescript";
import { DB_URI } from "../utils/secret";
import { sequelizeAdditions } from "../utils/sequelizeAdditions";

sequelizeAdditions(Sequelize);

const sequelize = new Sequelize(DB_URI, {
  models: [__dirname]
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    console.log("Database connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
})();

export default sequelize;