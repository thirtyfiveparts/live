'use strict';

var Sequelize = require('sequelize');

/**
 * Actions summary:
 *
 * createTable 'sessions', deps: []
 * createTable 'orgs', deps: []
 * createTable 'users', deps: ["core"."orgs"]
 * createTable 'tags', deps: ["core"."tags"]
 * createTable 'tagsancestors', deps: ["core"."tags", "core"."tags"]
 *
 **/

var info = {
    "revision": 1,
    "name": "foo",
    "comment": ""
};

var migrationCommands = [
  {
    fn: "createTable",
    params: [
      "sessions",
      {
        sid: { primaryKey: true, type: Sequelize.STRING },
        sess: { type: Sequelize.JSON },
        expire: { type: Sequelize.DATE },
      },
      { schema: "core" },
    ],
  },

  {
    fn: "createTable",
    params: [
      "orgs",
      {
        id: { primaryKey: true, allowNull: true, type: Sequelize.STRING },
        name: { type: Sequelize.STRING },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
      },
      { schema: "core" },
    ],
  },

  {
    fn: "createTable",
    params: [
      "users",
      {
        id: { primaryKey: true, allowNull: true, type: Sequelize.STRING },
        email: { validate: { isEmail: true }, type: Sequelize.STRING },
        password: { type: Sequelize.STRING },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
        org_id: {
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
          references: {
            model: {
              tableName: "orgs",
              table: "orgs",
              name: "org",
              schema: "core",
              delimiter: ".",
            },
            key: "id",
          },
          allowNull: true,
          type: Sequelize.STRING,
        },
      },
      { schema: "core" },
    ],
  },

  {
    fn: "createTable",
    params: [
      "tags",
      {
        id: { primaryKey: true, allowNull: true, type: Sequelize.STRING },
        name: { type: Sequelize.STRING },
        parent_id: {
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
          references: {
            model: {
              tableName: "tags",
              table: "tags",
              name: "tag",
              schema: "core",
              delimiter: ".",
            },
            key: "id",
          },
          allowNull: true,
          type: Sequelize.STRING,
        },
        hierarchy_level: { type: Sequelize.INTEGER },
        type: { type: Sequelize.STRING },
        created_at: { allowNull: false, type: Sequelize.DATE },
        updated_at: { allowNull: false, type: Sequelize.DATE },
      },
      { schema: "core" },
    ],
  },

  {
    fn: "createTable",
    params: [
      "tagsancestors",
      {
        tag_id: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: {
              tableName: "tags",
              table: "tags",
              name: "tag",
              schema: "core",
              delimiter: ".",
            },
            key: "id",
          },
          primaryKey: true,
          unique: "tagsancestors_tag_id_ancestor_id_unique",
          allowNull: false,
          type: Sequelize.STRING,
        },
        ancestor_id: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: {
              tableName: "tags",
              table: "tags",
              name: "tag",
              schema: "core",
              delimiter: ".",
            },
            key: "id",
          },
          primaryKey: true,
          unique: "tagsancestors_tag_id_ancestor_id_unique",
          allowNull: false,
          type: Sequelize.STRING,
        },
      },
      { schema: "core" },
    ],
  },
];


var rollbackCommands = [
  { fn: "dropTable", params: [{ tableName: "orgs", schema: "core" }] },
  { fn: "dropTable", params: [{ tableName: "users", schema: "core" }] },
  { fn: "dropTable", params: [{ tableName: "tags", schema: "core" }] },
  { fn: "dropTable", params: [{ tableName: "tagsancestors", schema: "core" }] },
  { fn: "dropTable", params: [{ tableName: "sessions", schema: "core" }] },
];


module.exports = {
    pos: 0,
    up: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < migrationCommands.length)
                {
                    let command = migrationCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    down: function(queryInterface, Sequelize)
    {
        var index = this.pos;
        return new Promise(function(resolve, reject) {
            function next() {
                if (index < rollbackCommands.length)
                {
                    let command = rollbackCommands[index];
                    console.log("[#"+index+"] execute: " + command.fn);
                    index++;
                    queryInterface[command.fn].apply(queryInterface, command.params).then(next, reject);
                }
                else
                    resolve();
            }
            next();
        });
    },
    info: info
};
