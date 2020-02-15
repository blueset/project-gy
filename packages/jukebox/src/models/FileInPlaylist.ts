import { MusicFile } from "./MusicFile";
import { DataTypes } from "sequelize";
import { Model, CreatedAt, UpdatedAt, DeletedAt, Column, Table, PrimaryKey, ForeignKey, AutoIncrement } from "sequelize-typescript";
import { Playlist } from "./Playlist";

@Table
export class FileInPlaylist extends Model<FileInPlaylist> {

  @AutoIncrement
  @PrimaryKey
  @Column({ type: new DataTypes.INTEGER })
  public id!: number;

  @ForeignKey(() => MusicFile)
  @Column
  fileId: number;

  @ForeignKey(() => Playlist)
  @Column
  playlistId: number;

  @CreatedAt
  creationDate: Date;

  @UpdatedAt
  updatedOn: Date;

}