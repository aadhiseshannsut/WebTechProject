<?php
  // connect to database and start session
  include("database.php");
  session_start();
  
  // get userId
  function getUserId($username) {
    global $conn;
    $userID = null;
    // get userID
    $sql = "SELECT * FROM  USERS WHERE username = '$username'";

    // query result
    $res = mysqli_query($conn, $sql);


    if (mysqli_num_rows($res) > 0) {
        $row = mysqli_fetch_assoc($res);
        $userID = $row['userID'];
    }
    
    $_SESSION['userID'] = $userID;
  }
  
  // LOGIN
  function login($username, $password) {
    global $conn;
    
    // form validation
    if (empty($username)) {
      echo 'Please enter a valid Username';
    }
    elseif (empty($password)) {
      echo 'Please enter a valid Password';
    }
    else {
      
      // query generation
      $sql = "SELECT * FROM USERS WHERE username = '$username'";
      
      // query result
      $res = mysqli_query($conn, $sql);
      
      if (mysqli_num_rows($res) > 0) {
        $row = mysqli_fetch_assoc($res);

        // verify password
        if (password_verify($password, $row["password"])){
          $_SESSION['username'] = $username;
          getUserId($username);
          echo 'Logged in Successfully';
        }
        else {
          echo 'Wrong Password entered';
          session_destroy();
        }
      }
      else{
        echo 'Wrong Username entered';
        session_destroy();  
      }
    }
  }
  
  // REGISTER
  function signup($username, $password, $cpassword) {
    global $conn;
    
    // form validation
    if (empty($username)) {
      echo 'Please enter a valid Username';
    }
    else if (empty($password)) {
      echo 'Please enter a valid Password';
    }
    else if ($password == $cpassword){
      
      // hash generation
      $hash = password_hash($password, PASSWORD_DEFAULT);
      
      // query generation
      $sql = "INSERT INTO USERS (username, password) VALUES ('$username', '$hash')";
      
      try{
        mysqli_query($conn, $sql);
        $_SESSION['username'] = $username;
        getUserId($username);
        echo "Account created successfully"; // no error
      }
      catch(mysql_sql_exception) {
        echo "Failed to Register new user (Username already taken)."; // BUG-ERROR: results in status = 500
        session_destroy();
      }   
    }
    else {
      echo 'Passwords do not match';
      session_destroy();
    }
  }
  
  if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_POST['action']) && $_POST['action'] == 'LOGIN')
        login($_POST['username'], $_POST['password']);

    else if (isset($_POST['action']) && $_POST['action'] == 'REGISTER')
        signup($_POST['username'], $_POST['password'], $_POST['cpassword']);
   
  }
  mysqli_close($conn);
?>