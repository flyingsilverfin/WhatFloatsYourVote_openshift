const db_funcs = require('../db/db');
const db_get_data = db_funcs.get_data;
const db_save_data = db_funcs.save_data;

const express = require('express');
const validator = require('validator');


const router = new express.Router();


/**
 * Validate the sign up form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateSignupForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    isFormValid = false;
    errors.password = 'Password must have at least 8 characters.';
  }

  if (!payload || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    isFormValid = false;
    errors.name = 'Please provide your name.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

router.post('/signup', (req, res) => {
  const validationResult = validateSignupForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }

  return res.status(200).end();
});

router.post('/login', (req, res) => {
  const validationResult = validateLoginForm(req.body);
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }

  return res.status(200).end();
});





// retrieved staged data
router.get('/staged/data', (req, res) => {
  db_get_data('staged', (staged) =>
    db_get_data('live', (live) => {
      // this is quite inefficient but whatever
      // won't be used often I think
      let staged_string = JSON.stringify(staged);
      let live_string = JSON.stringify(live);
      let modified = staged_string !== live_string;

      res.send({
        status: 'success',
        data: staged,
        modified: modified
      })      
    })
  )}
);

// add a property to object/element in array
router.post('/staged/modify/add', (req, res) => {
  let data = req.body;
  let json_path = data.json_path;
  let added = data.value;


  db_get_data('staged', (staged) => {
    
    let root = staged;
    for (let elem of json_path) {
      root = root[elem];
    }

    for (let key in added) {
      root[key] = added[key]; //add to array or object!
    }

    // save it back to the DB
    db_save_data('staged', staged, (result) => {
      console.log('sucess writing new values');
      res.send({'status': 'sucess'})
      res.status(400);
    });
  });
});

// delete a property/element in array
router.post('/staged/modify/delete', (req,res) => {
  let data = req.body;
  let json_path = data.json_path;

  db_get_data('staged', (staged) => {
    let root = staged;
    for (let elem of json_path.slice(0,json_path.length-1)) {
      root = root[elem];
    }
    if (isArray(root)) {
      // cut out array and reindex array
      root.splice(json_path[json_path.length-1], 1);   
    } else {
      // deleting works fine in objects
      delete root[json_path[json_path.length-1]];
    }
  
    // save it back to the DB
    db_save_data('staged', staged, (result) => {
      console.log('sucess writing deletion to staged');
      console.log(result); 
      res.send({'status': 'sucess'})
      res.status(400);
    });
  });
});

// edit a value somewhere in document
router.post('/staged/modify/edit', (req, res) => {
  let data = req.body;
  let json_path = data.json_path;
  let new_value = data.value;

  console.log("received path and data");

  db_get_data('staged', (staged) => {
    let root = staged;
    for (let elem of json_path.slice(0,json_path.length-1)) {
      root = root[elem];
    }
    root[json_path[json_path.length-1]] = new_value;

    // save it back to the DB
    db_save_data('staged', staged, (result) => {
      console.log('sucess writing edit to staged');
      console.log(result);
      res.send({'status': 'sucess'})
      res.status(400);
    });
  });
});

// rename a property of an object
router.post('/staged/modify/rename', (req, res) => {
  let data = req.body;
  let json_path = data.json_path;
  let new_name = data.new_name;


  db_get_data('staged', (staged) => {
    let ptr = staged;
    for (let elem of json_path.slice(0,json_path.length-1)) {
        ptr = ptr[elem];
    }
    let old_name = json_path[json_path.length-1]; 
    let tmp = ptr[old_name];
    delete ptr[old_name];
    ptr[new_name] = tmp;  // copy into new name
    
    // save it back to the DB
    db_save_data('staged', staged, (result) => {
      console.log('sucess writing rename to staged');
      console.log(result);
      res.send({'status': 'sucess'})
      res.status(400);
    });
  });
});

// overwrite live with staged ie. publish
router.post('/staged/publish', (req, res) => {
  db_get_data('staged', (staged) => {
    db_save_data('live', staged, (result) => {
      console.log('sucess pushing staged to live');
      res.send({'status': 'sucess'})
      res.status(400);
    });
  });
})

// overwrite staged changes with live document
router.post('/staged/delete', (req, res) => {
  db_get_data('live', (live) => {
    db_save_data('staged', live, (result) => {
      console.log('sucess overwriting staged with live');
      res.send({'status': 'sucess'})
      res.status(400);
    });
  });
})


module.exports = router;



//--- temporary helpers, move out later TODO ---
function isArray(arr) {
    if (Array.isArray) {
        return Array.isArray(arr);
    } else {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
}