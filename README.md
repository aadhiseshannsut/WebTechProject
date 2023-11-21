# To-Do List(Web Technology Project)
## Link : http://sem3todolist.rf.gd/

## Backend

### Database Schema

#### USERS Table

- **UserID:** int(11) & Auto Incremented (PRIMARY KEY)
- **Username:** varchar(255) Unique
- **Password:** varchar(255) Hashed

#### CATEGORIES Table

- **CategoryID:** int(11) (PRIMARY KEY)
- **CategoryName:** varchar(255)

#### TASKS Table

- **TaskID:** int(11) (PRIMARY KEY)
- **Title:** varchar(255)
- **Description:** varchar(255)
- **DueDate:** date
- **Completed:** tinyint(1) BOOLEAN
- **CategoryID:** (FOREIGN KEY from CATEGORY)
- **UserID:** (FOREIGN KEY from USERS)

### User Actions

- A user can only access the tasks they created.
- Ability to Create, Edit, and Delete tasks they created.
- No two users can have the same Username.
- User's User-ID is used for identification and is not disclosed to the user (Redundancy).

### User Actions Effect on Database

- **Add Task:** Adds a new record to TASKS, referencing 'categoryID' and 'userID' attributes from 'USERS' & 'CATEGORY'.
- **Edit Task:** Performs the UPDATE operation on a specific Task's record using its 'taskID'.
- **Mark As Done:** Sets the 'completed' attribute to '1' for the selected task.
- **Delete Task:** Removes the selected task from 'TASKS'.

## Frontend

### HTML

- **index.html:** Introduction page to the project.
- **signin.html:** Page for user login.
- **signup.html:** Page for user sign-up.
- **main.html:** Allows users to perform typical To-Do List actions.

### JavaScript

- AJAX is used with JavaScript for asynchronous webpage updates.
- Emphasis on minimizing DOM manipulation for user actions.

### CSS

- Styles webpages, controls layout, and provides responsive design.

## Getting Started

1. Clone the repository.
2. Set up the backend database with the specified schema.
3. Host the backend using a server that supports PHP.
4. Open HTML files in a browser or deploy on a web server.
