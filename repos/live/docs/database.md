## How to manage migrations when multiple apps share the same database?

One service must manage migrations.

Some discussion: https://stackoverflow.com/questions/13588642/how-to-manage-migrations-when-multiple-apps-share-the-same-database-in-ruby

---

## `Model.findOrCreate`

```
// good
const [userGD, didCreateUser] = await models.User.findOrCreate({

// bad
const [userGD, createdUser] = await models.User.findOrCreate({
```
