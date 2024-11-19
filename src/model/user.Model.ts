import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

class User extends Model {
  public readonly id!: number;
  public first_name!: string;
  public last_name!: string;
  public password!: string;
  public email!: string;
  public readonly account_created!: Date;
  public account_updated!: Date;
  public isVerified!: boolean;
  public email_sent_at!: Date;
  public token!: string;
  public token_expiry!: Date;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: uuidv4,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  isVerified: {
    type:DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_sent_at: {
    type: DataTypes.DATE,
  },
  token: {
    type: DataTypes.STRING,
  },
  token_expiry: {
    type: DataTypes.DATE,
  },
  account_created: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  account_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'users',
  timestamps: false,
});

export default User;
