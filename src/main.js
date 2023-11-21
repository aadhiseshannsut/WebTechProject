/*no vDOM (for now)*/

/*global variables*/
// user
let username = null;
let userID = null;

// global variable for storing all tasks by that user
// updates for all update and delete operations
let allTasksJSON = undefined;

// global variable for storing all tasks by that user
// cannot be update by user's actions
let allCategoriesJSON = undefined;

// stores currently selected list element
// updates value upon clicking a task (list element)
let selectedListElement = undefined;

// previously selected list element
let previouslySelectedListElement = undefined;

// stores task id's for 'UNDO'
// only Mark As Done & Delete operations will add to this stack
let undoStack = [];

// stores id's of tasks that are 'to be' marked as done
let tasksToMark = [];

// stores id's of tasks that are 'to be' deleted
let tasksToDelete = [];


/*vDOM*/
// stores the id and innerText of all list elements
let reducedElements = {}; // { taskID: [title, status]}
let oldReducedListElements = {};

/*DOM elements*/
// page
const container = document.querySelector(".container");
const addTaskContainer = document.querySelector(".addTask-container");
const overlay = document.getElementById('overlay');
// lists
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
// task
const undoBtn = document.getElementById('undo');
const confirmBtn = document.getElementById('confirm');
const taskDescription = document.getElementById('overview-text');
const taskDueDate = document.getElementById('dueDate');
const taskCategory = document.getElementById('category');
// page buttons
const logoutBtn = document.getElementById('logoutBtn');
const editTaskBtn = document.getElementById('editTask');
const markAsDoneBtn = document.getElementById('markAsDone');
const deleteTaskBtn = document.getElementById('deleteTask');
const addTaskMainBtn = document.getElementById('addTaskMainBtn');


/*pop-ups*/
const addTaskForm = document.getElementById('addTask-popup');
const editTaskForm = document.getElementById('editTask-popup');
// pop-up buttons
const addTaskFormBtn = document.getElementById('addTaskFormBtn');
const editTaskFormBtn = document.getElementById('editTaskFormBtn');
const closeAddTaskFormBtn = document.getElementById('closeAddTaskFormBtn');
const closeEditTaskFormBtn = document.getElementById('closeEditTaskFormBtn');
// form validation messages
const addProcessMessage = document.getElementById('addProcessMessage');
const editProcessMessage = document.getElementById('editProcessMessage');
// form inputs
// add task form
const addTaskTitle = document.getElementById('addTaskTitle');
const addTaskDescription = document.getElementById('addTaskDescription');
const addTaskDate = document.getElementById('addTaskDate');
const addCategory = document.getElementById('addCategory-list');
// edit task form
const editTaskTitle = document.getElementById('editTaskTitle');
const editTaskDescription = document.getElementById('editTaskDescription');
const editTaskDate = document.getElementById('editTaskDate');
const editCategory = document.getElementById('editCategory-list');


/*basic functions*/
// create list element
function createNewListElement(taskID, taskTitle, status){
    // create list element
    let li = document.createElement('li');
    li.setAttribute('id', taskID);
    li.innerText = taskTitle;
    
    // respond to click
    activateListElement(li);
        
    // push to completed list if completed, push to pending list otherwise
    (status == 1) ? completedList.append(li): pendingList.append(li);
}

// find the JSON object with the given task ID (optimized)
function findTaskObject(taskID) {
  return allTasksJSON.find(task => task.taskID === taskID) || null;
}

// activate all list elements
function activateListElement(li) {
  li.addEventListener('click', () => {
    selectedListElement = li;
    displayDetails(findTaskObject(selectedListElement.id));
    if (previouslySelectedListElement)
      previouslySelectedListElement.classList.remove('task-selected');
    previouslySelectedListElement = li;
    li.classList.add('task-selected');
  });
}

// update reduced elements
function updateReducedElements(){
  allTasksJSON.forEach(task => reducedElements[task.taskID] = [task.title, task.completed]);
}

/*Load tasks*/
// load all tasks onto page as list elements
function loadAllTaskElements() {
  let id = undefined;
  let title = undefined;
  let status = undefined;
  
  allTasksJSON.forEach((task)=>{
    id = task.taskID;
    title = task.title;
    status = task.completed;
    
    reducedElements[id] = [title, status];
    oldReducedListElements[id] = [title, status];
    // create new element
    createNewListElement(id, title, status);
  });
}

// load all task-categories
function loadCategories(){
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  // parameters
  let params = "action=LOADCATEGORIES";
  
  xhr.onload = function(){
    if (this.status == 200){
      let output = JSON.parse(this.responseText);
      allCategoriesJSON = output;
    }
  }
  xhr.send(params);
}

// load all tasks made by the current user
function loadTasks(){
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  // parameters
  let params = "action=LOADTASKS";
  
  xhr.onload = function(){
    if (this.status == 200){
      allTasksJSON = JSON.parse(this.responseText);

      updateReducedElements();
      
      let taskIDs = Object.keys(reducedElements);
      // preserveDOM if no old list elements are present
      (Object.keys(oldReducedListElements).length < 1) ? loadAllTaskElements() : preserveDOM();

      // reset selected element
      selectedListElement = undefined;
      
      //   // Check for empty lists
      // const noPendingTasksFlag = pendingList.childNodes.length < 1;
      // const noCompletedTasksFlag = completedList.childNodes.length < 1;

      // // Show/hide "No Tasks" messages
      // showNoTasksMessage(noPendingTasksFlag, 'noPendingTasks', pendingList);
      // showNoTasksMessage(noCompletedTasksFlag, 'noCompletedTasks', completedList);
    }
  };
  xhr.send(params);
}

// // no tasks message
// function showNoTasksMessage(flag, messageId, list) {
//   const messageElement = document.getElementById(messageId);

//   if (flag) {
//     if (!messageElement) {
//       const noTasksMessage = document.createElement('li');
//       noTasksMessage.setAttribute('id', messageId);
//       noTasksMessage.innerText = 'No Tasks';
//       noTasksMessage.style.opacity = '60%';
//       list.append(noTasksMessage);
//     }
//   } else {
//     if (messageElement) 
//       messageElement.remove();
//   }
// }

/*-----------magic(minimal change to page)-------------------------------*/
// load all tasks onto the page without updating existing list elements
function preserveDOM() {
  let newtitle = undefined;
  let oldtitle = undefined;
  let newStatus = undefined;
  let oldStatus = undefined;

  Object.keys(oldReducedListElements).forEach((taskID) => {

    // check if the element still exists in the updated data
    if (reducedElements[taskID] !== undefined) {
      newtitle = reducedElements[taskID][0];
      oldtitle = oldReducedListElements[taskID][0];
      newStatus = reducedElements[taskID][1];
      oldStatus = oldReducedListElements[taskID][1];

      let li = document.getElementById(taskID);
      // check for title change
      if (li && (newtitle !== oldtitle)) {
        li.innerText = newtitle;
      }

      // check for status change
      if (li && (newStatus !== oldStatus)) {
        if (newStatus == 1) {
          completedList.appendChild(li);
          li.classList.remove('marked');
        } else {
          pendingList.appendChild(li);
        }
      }
    } else {
      // element doesn't exist in the updated data
      li.remove();
      // remove from oldReducedListElements
      delete oldReducedListElements[taskID];
    }
  });

  // update oldReducedListElements for new elements
  Object.keys(reducedElements).forEach((taskID) => {
    if (oldReducedListElements[taskID] === undefined) {
      oldReducedListElements[taskID] = reducedElements[taskID];
      // create new element
      createNewListElement(taskID, reducedElements[taskID][0], reducedElements[taskID][1]);
    }
  });
}
/*-----------------------------------------------------------------------------*/

/*Display selected Task Details*/
// display all task details in the bottom right corner
function displayDetails(taskObject){
  taskDescription.innerText = taskObject.description;
  taskDueDate.innerText = taskObject.dueDate;  
  allCategoriesJSON.forEach((category)=> {
    if (taskObject.categoryID == category.categoryID)
      taskCategory.innerText = category.name;
  });
}

/*Mark as Done*/
// mark selected task as done
function markAsDone(taskID){
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  // parameters
  let params = "action=MARKASDONE"+"&taskID="+taskID;
  xhr.send(params);
}

// prepare list element
function prepareToMarkTask() {
  // check if already completed
  if (oldReducedListElements[selectedListElement.id][1] == 0){
    selectedListElement.classList.add('marked');
    // push to stack
    tasksToMark.push(selectedListElement.id);
    undoStack.push(selectedListElement.id);
  }
}


/*Delete a Task*/
// delete all selected tasks
function deleteTask(taskID) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  // parameters
  let params = "action=DELETETASK"+"&taskID="+taskID;
  xhr.onload = function(){
    if (this.status == 200){
      if (this.responseText == "true"){
        document.getElementById(taskID).remove();
      }
    }
  }
  xhr.send(params);
}

// prepare list element
function prepareToDeleteTask(){
  selectedListElement.classList.add('deleted');
  // push to stack
  tasksToDelete.push(selectedListElement.id);  
  undoStack.push(selectedListElement.id);
}


/*Add a Task*/

function showOverlay() {
  overlay.style.opacity = "50%";
  overlay.style.pointerEvents = "all";
}

function hideOverlay() {
  overlay.style.opacity = "0";
  overlay.style.pointerEvents = "none";
}

// open Add Task form
function openAddTaskForm(){
  addTaskForm.classList.add('pop-up-active');
  showOverlay();
}

// open Add Task form
function closeAddTaskForm(){
  // clear input fields
  addTaskTitle.value = "";
  addTaskDescription.value = "";
  addTaskDate.value = "";
  addCategory.value = "";
  
  
  // reset message
  addProcessMessage.classList.remove('processMessage-active');
  
  hideOverlay();  
  addTaskForm.classList.remove('pop-up-active');
}

// adding a task
function addTask(){
  const title = addTaskTitle.value;
  const description = addTaskDescription.value;
  const dueDate = addTaskDate.value;
  const categoryID = addCategory.value;
    
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  const params = "action=ADDTASK"+"&title="+title+"&description="+description+"&dueDate="+dueDate+"&categoryID="+categoryID;
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (this.status == 200){
      const output = this.responseText;
      addProcessMessage.innerText = output;
      addProcessMessage.classList.add('processMessage-active');
      // reload page if added
      if (output == "Successfully added task"){
        loadTasks();
        closeAddTaskForm();
      }
    }
  }
  xhr.send(params);
}


/*Edit a Task*/
// open Edit Task form
function openEditTaskForm(li){
  if (li){
    showOverlay();
    let taskObject = findTaskObject(li.id);  
    editTaskForm.classList.add('pop-up-active');
    // show previous values
    editTaskTitle.value = taskObject.title;
    editTaskDescription.value = taskObject.description;
    editTaskDate.value = taskObject.dueDate;
    editTaskFormBtn.value = taskObject.taskID;
  }
}

// open Edit Task form
function closeEditTaskForm(){
  // clear input fields
  editTaskTitle.value = "";
  editTaskDescription.value = "";
  editTaskDate.value = "";
  editCategory.value = "";
  // reset message
  editProcessMessage.classList.remove('processMessage-active');

  hideOverlay();  
  editTaskForm.classList.remove('pop-up-active');
}

// editing a task
function editTask(){
  const taskID = editTaskFormBtn.value;
  const title = editTaskTitle.value;
  const description = editTaskDescription.value;
  const dueDate = editTaskDate.value;
  const categoryID = editCategory.value;

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  const params = "action=EDITTASK"+"&taskID="+taskID+"&title="+title+"&description="+description+"&dueDate="+dueDate+"&categoryID="+categoryID;
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (this.status == 200){
      const output = this.responseText;
      editProcessMessage.innerText = output;
      editProcessMessage.classList.add('processMessage-active');
      // reload page if edited
      if (output == "Successfully updated task"){
        loadTasks();
        closeEditTaskForm();
      }
    }
  }
  xhr.send(params); 
}


/*Undo*/
// resets the last selection and resets the task
function undoSelection(){
  if (undoStack.length > 0){
    // remove from undo stack
    let x = undoStack.pop();
    
    const y = tasksToMark.findIndex(task => task === x);
    const z = tasksToDelete.findIndex(task => task === x);
    
    // reset to initial config
    // remove from marked tasks
    if (y > -1){    
      tasksToMark.pop()
      document.getElementById(x).classList.remove('marked');
    } 
    
    // remove from deleted tasks
    if (z > -1){
      tasksToDelete.pop();
      document.getElementById(x).classList.remove('deleted');
    }
  }
}

/* prepare list element (ui)*/
// updates list elements (no effect on database)
// first operation gets priority
function prepareListElement(operation){
  // if element doesn't exist in any stacks
  if (!undoStack.includes(selectedListElement.id)){
    // only for pending tasks
    if (operation == "done")
      prepareToMarkTask();
    else if (operation == "delete")
      prepareToDeleteTask();
  }
}


/*Confirm*/
// confirm choices and execute queries
function confirmChoices(){
  // check for changes
  let markedFlag = false;
  let deletedFlag = false;
  
  // mark as done
  if (tasksToMark.length > 0){
    tasksToMark.forEach(task=>markAsDone(task));
    markedFlag = true;
  }
  // delete
  if (tasksToDelete.length > 0){ 
    tasksToDelete.forEach(task=>deleteTask(task));
    deletedFlag = true;
  }
  
  
  // update page (only if any change is made)
  if (markedFlag || deletedFlag){
    loadTasks();
    // reset stacks
    undoStack = [];
    tasksToMark = [];
    tasksToDelete = [];
  } 
}


/*Simple functions*/
// display welcome message
function welcomeMessage(callback){
  let h1 = document.getElementById('welcomeMessage');
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  // parameters
  let params = "action=WELCOME";
  
  xhr.onload = function(){
    if (this.status == 200){
      let output = JSON.parse(this.responseText);
      username = output.username;
      userID = output.userID;
      h1.innerText = '> '+output.message+' _';
      callback(String(output.success));
    }
  }
  xhr.send(params);
}

// logout user
function logout(){
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'process/main.php', true);
  xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
  // parameters
  let params = "action="+logoutBtn.value;
  
  xhr.onload = function(){
    if (this.status == 200){
      let output = this.responseText;
      setTimeout(()=>{window.location.href='index.html';},100);
    }
  }
  xhr.send(params);
}

/*event listeners*/
// logout user
logoutBtn.addEventListener('click', logout);

// add task popup close on-click

// undo last task selection
undoBtn.addEventListener('click', undoSelection);

// mark a task as done
markAsDoneBtn.addEventListener('click', () => prepareListElement("done") );

// mark a task to delete
deleteTaskBtn.addEventListener('click', () => prepareListElement("delete"));

// confirm choices
confirmBtn.addEventListener('click', confirmChoices);

// pop-up
// open add task form
addTaskMainBtn.addEventListener('click', openAddTaskForm);

// submit add task form
addTaskFormBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  addTask();
});

// close add task form
closeAddTaskFormBtn.addEventListener('click', closeAddTaskForm);

// open edit task form
editTaskBtn.addEventListener('click',()=>{openEditTaskForm(selectedListElement)});

// submit edit task form
editTaskFormBtn.addEventListener('click', (e)=>{
  e.preventDefault();
  editTask();
});

// close edit task form
closeEditTaskFormBtn.addEventListener('click', closeEditTaskForm);

// overlay
overlay.addEventListener('click',()=>{
  closeAddTaskForm();
  closeEditTaskForm();  
});

// on window load
window.addEventListener('load', ()=>{
  // display welcome message
  let userMessage = welcomeMessage((userMessage)=>{
    if (userMessage == "true"){
      // load all task-categories
      loadCategories();
      // load all users tasks
      loadTasks();    
    }
    else {
      container.style.pointerEvents = "none";
      container.style.opacity = "50%";
    }
  });
});


// console.log(title, description, dueDate, categoryID);