const express = require('express')
const app = express()
app.use(express.json())
var add = require('date-fns/add')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbpath = path.join(__dirname, 'todoApplication.db')
let db = null
const initializer = async () => {
  db = await open({
    filename: dbpath,
    driver: sqlite3.Database,
  })
}

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}
const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}
const checkRequestsBody = (request, response, next) => {
  const {id, todo, category, priority, status, dueDate} = request.body
  const {todoId} = request.params

  if (category !== undefined) {
    categoryArray = ['WORK', 'HOME', 'LEARNING']
    categoryIsInArray = categoryArray.includes(category)

    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (dueDate !== undefined) {
    try {
      const myDate = new Date(dueDate)
      const formatedDate = format(new Date(dueDate), 'yyyy-MM-dd')
      console.log(formatedDate)
      const result = toDate(new Date(formatedDate))
      const isValidDate = isValid(result)
      console.log(isValidDate)
      console.log(isValidDate)
      if (isValidDate === true) {
        request.dueDate = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }
  request.todo = todo
  request.id = id

  request.todoId = todoId

  next()
}
const checkRequestsQueries = async (request, response, next) => {
  const {search_q, category, priority, status, date} = request.query
  const {todoId} = request.params
  if (category !== undefined) {
    const categoryArray = ['WORK', 'HOME', 'LEARNING']
    const categoryIsInArray = categoryArray.includes(category)
    if (categoryIsInArray === true) {
      request.category = category
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const priorityIsInArray = priorityArray.includes(priority)
    if (priorityIsInArray === true) {
      request.priority = priority
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusIsInArray = statusArray.includes(status)
    if (statusIsInArray === true) {
      request.status = status
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
      return
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date)

      const formatedDate = format(new Date(date), 'yyyy-MM-dd')
      console.log(formatedDate, 'f')
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      console.log(result, 'r')
      console.log(new Date(), 'new')

      const isValidDate = await isValid(result)
      console.log(isValidDate, 'V')
      if (isValidDate === true) {
        request.date = formatedDate
      } else {
        response.status(400)
        response.send('Invalid Due Date')
        return
      }
    } catch (e) {
      response.status(400)
      response.send('Invalid Due Date')
      return
    }
  }

  request.todoId = todoId
  request.search_q = search_q

  next()
}

app.get('/todos/', checkRequestsQueries, async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {
    search_q = '',
    priority = '',
    status = '',
    category = '',
  } = request.query

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
     id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
     id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`
      break
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
     id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`
      break
    case hasCategoryProperty(request.query):
      getTodosQuery = `
   SELECT
     id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
   FROM
    todo 
   WHERE
   category='${category}';`
      break
    default:
      getTodosQuery = `
   SELECT
     id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`
  }

  data = await db.all(getTodosQuery)
  response.send(data)
})

app.get('/agenda/', checkRequestsQueries, async (request, response) => {
  const {date} = request.params
  console.log(date, 'a')

  const selectDuaDateQuery = `
        SELECT
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate
        FROM 
            todo
        WHERE 
            due_date = '${date}'
        ;`

  const todosArray = await db.all(selectDuaDateQuery)

  if (todosArray === undefined) {
    response.status(400)
    response.send('Invalid Due Date')
  } else {
    response.send(todosArray)
  }
})

app.get('/todos/:todoId/', checkRequestsQueries, async (request, response) => {
  const {todoId} = request.params
  const getBookQuery = `
    SELECT
       id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
    FROM
      todo
    WHERE
      id = ${todoId};`
  const book = await db.get(getBookQuery)
  response.send(book)
})

app.post('/todos/', checkRequestsBody, async (request, response) => {
  const {todoId} = request.params
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`
  const previousTodo = await db.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body
  const addBookQuery = `
    INSERT INTO 
            todo (id, todo, priority, status, category, due_date)
        VALUES
            (
                ${todoId},
               '${todo}',
               '${priority}',
               '${status}',
               '${category}',
               '${dueDate}'
            );`

  const dbResponse = await db.run(addBookQuery)

  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', checkRequestsBody, async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
    case requestBody.category !== undefined:
      updateColumn = 'Category'
      break
    case requestBody.dueDate !== undefined:
      updateColumn = 'Due Date'
      break
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`
  const previousTodo = await db.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
      category='${category}',
      due_date=${dueDate},
    WHERE
      id = ${todoId};`

  await db.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

app.delete(
  '/todos/:todoId/',
  checkRequestsQueries,
  async (request, response) => {
    const {todoId} = request.params
    const deleteBookQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`
    await db.run(deleteBookQuery)
    response.send('Todo Deleted')
  },
)

app.listen(3000)
initializer()
module.exports = app
