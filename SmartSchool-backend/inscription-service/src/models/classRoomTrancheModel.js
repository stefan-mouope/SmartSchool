import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const ClassRoomTranche = sequelize.define("ClassRoomTranche", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  classRoom_id: {  
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tranche_id: {    
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {         
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: "ClassRoomTranche",
  timestamps: false,
});

export default ClassRoomTranche;
