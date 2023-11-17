<?php
    include("database.php");
    session_start();
    
    // display welcome message
    function welcome() {
        global $conn;
        $username = $_SESSION['username'];
        $userID = $_SESSION['userID'];
        
        if ($userID != null)
            echo json_encode(['username' => $username, 'userID' => $userID, 'message' => 'Welcome '.$username, 'success' => 'true']);
        else
            echo json_encode(['username' => null, 'userID' => null, 'message' => 'Please Sign in again', 'success' => 'false']);
    }
    
    // logout user
    function logout() {
        session_destroy();
        echo 'Logged Out';
    }
    
    // return all tasks relating to the current user
    function loadTasks() {
        global $conn;
        
        $sql = "SELECT * FROM TASKS WHERE userID = '{$_SESSION['userID']}' ORDER BY dueDate";
        
        $res = mysqli_query($conn, $sql);

        if (mysqli_num_rows($res) > 0) {
            // final json response
            $taskDetails = array();
            
            // Fetching all rows as an associative array
            $rows = mysqli_fetch_all($res, MYSQLI_ASSOC);

            // processing retrieved rows
            foreach ($rows as $row) {
                $taskDetails[] = array(
                    "taskID" => $row['taskID'], 
                    "title" => $row['title'], 
                    "description" => $row['description'], 
                    "dueDate" => $row['dueDate'], 
                    "categoryID" => $row['categoryID'],
                    "completed" => $row['completed']
                );
            }
            
            echo json_encode($taskDetails);
        }
        else
            echo json_encode([]);
    }
    
    // return all task-categories and their id values
    function loadCategories() {
        global $conn;
        
        $sql = "SELECT * FROM CATEGORY";
        
        $res = mysqli_query($conn, $sql);

        if (mysqli_num_rows($res) > 0) {
            // final json response
            $categoryDetails = array();
            
            // Fetching all rows as an associative array
            $rows = mysqli_fetch_all($res, MYSQLI_ASSOC);

            // processing retrieved rows
            foreach ($rows as $row) {
                $categoryDetails[] = array(
                    "categoryID" => $row['categoryID'], 
                    "name" => $row['categoryName'] 
                );
            }
            
            echo json_encode($categoryDetails);
        }
        else
            echo json_encode([]);
    }
    
    // mark a task as done
    function markAsDone($taskID) {
        global $conn;
        $sql = "UPDATE TASKS SET completed = 1 WHERE taskID = {$taskID}";
        try {
            $res = mysqli_query($conn, $sql);
            echo "true"; // marked as done
        }
        catch(mysql_sql_exception) {
            echo "false";
        }
    }
    
    // delete a task
    function deleteTask($taskID) {
        global $conn;
        $sql = "DELETE FROM TASKS WHERE taskID = {$taskID}";
        try{
            mysqli_query($conn, $sql);
            echo "true"; // successfully deleted
        }
        catch(mysql_sql_exception) {
            echo "false";
        }  
    }
    
    // add a task
    function addTask($title, $description, $dueDate, $categoryID) {
        // form validation
        if (empty($title)) {
            echo "Please provide a title";
        } else if (empty($description)) {
            echo "Please provide a description";
        } else if (empty($dueDate)) {
            echo "Please provide a valid Due Date";
        } else if ($categoryID === null || $categoryID === "0") {
            echo "Please select a category";
        } 
        else {
            $categoryID = intval($categoryID);
            global $conn;
            $sql = "INSERT INTO TASKS (title, description, dueDate, categoryID, userID) VALUES('{$title}', '{$description}', '{$dueDate}', $categoryID, {$_SESSION['userID']})";
            try {
                mysqli_query($conn, $sql);
                echo "Successfully added task"; // successfully added task
            } 
            catch (mysql_sql_exception) {
                echo "Could not add task";
            }
        }
    }
    
    // edit a task
    function editTask($taskID, $title, $description, $dueDate, $categoryID) {
        // form validation
        if (empty($title)) {
            echo "Please provide a title";
        } else if (empty($description)) {
            echo "Please provide a description";
        } else if (empty($dueDate)) {
            echo "Please provide a valid Due Date";
        } else if ($categoryID === null || $categoryID === "0") {
            echo "Please select a category";
        } 
        else {
            $categoryID = intval($categoryID);
            global $conn;
            $sql = "UPDATE TASKS SET title = '{$title}', description = '{$description}', dueDate = '{$dueDate}', categoryID = {$categoryID} WHERE taskID = {$taskID}";
            
            try {
                mysqli_query($conn, $sql);
                echo "Successfully updated task"; // successfully added task
            } 
            catch (mysql_sql_exception) {
                echo "Could not update task";
            }
        }
    }

    // main
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        if (isset($_POST['action']) && $_POST['action'] == 'WELCOME') {
            welcome();
        } 
        
        else if (isset($_POST['action']) && $_POST['action'] == 'LOGOUT') {
            logout();
        } 
        
        else if (isset($_POST['action']) && $_POST['action'] == 'LOADTASKS') {
            loadTasks();
        } 
        
        else if (isset($_POST['action']) && $_POST['action'] == 'LOADCATEGORIES') {
            loadCategories();
        } 
        
        else if (isset($_POST['action']) && $_POST['action'] == 'MARKASDONE') {
            $taskID = $_POST['taskID'];
            markAsDone($taskID);
        } 
        
        else if (isset($_POST['action']) && $_POST['action'] == 'DELETETASK') {
            $taskID = $_POST['taskID'];
            deleteTask($taskID);
        } 
        
        else if (isset($_POST['action']) && $_POST['action'] == 'ADDTASK') {
            addTask($_POST['title'], $_POST['description'], $_POST['dueDate'], $_POST['categoryID']);
        }
        
        else if (isset($_POST['action']) && $_POST['action'] == 'EDITTASK') {
            editTask($_POST['taskID'], $_POST['title'], $_POST['description'], $_POST['dueDate'], $_POST['categoryID']);
        }
    }
    
    mysqli_close($conn);
?>