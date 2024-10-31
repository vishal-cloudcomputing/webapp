import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database'; 

class Image extends Model {
  public id!: string;
  public file_name!: string;
  public url!: string;
  public upload_date!: string;
  public user_id!: string;
}

Image.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    upload_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
  },
  {
    sequelize,
    tableName: 'images',
    timestamps: false,
  }
);

export default Image;
