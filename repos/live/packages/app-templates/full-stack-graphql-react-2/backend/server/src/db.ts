import {Service} from 'typedi'

// Can't construct @Services.
//@Service
export class DB {

  constructor(sequelize) {
    this.sequelize = sequelize
  }

}
