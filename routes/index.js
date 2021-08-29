var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var userController = require('../controllers/userController');
var user = new userController();

var chatController = require('../controllers/chatController');
var chat_history = new chatController();

var User = require('../models/users');
var multer = require('multer');
const PATH = './uploads';

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    let sp = file.originalname.split('.');
    cb(null, file.fieldname + '-' + Date.now() + '.' + sp[sp.length - 1])
  }
});

let upload = multer({
  storage: storage
});

// POST File
router.post('/upload', upload.single('image'), function (req, res) {
  if (!req.file) {
    return res.send({
      success: false
    });

  } else {
    let filename = req.file.filename;
    return res.send({
      success: true,
      filename: filename
    })
  }
});


router.post('/upload-assignment', upload.single('assignment'), function (req, res) {
  if (!req.file) {
    return res.send({
      success: false
    });

  } else {
    let filename = req.file.filename;
    return res.send({
      success: true,
      filename: filename
    })
  }
});


router.post('/upload-homework', upload.single('homework'), function (req, res) {
  if (!req.file) {
    return res.send({
      success: false
    });

  } else {
    let filename = req.file.filename;
    return res.send({
      success: true,
      filename: filename
    })
  }
});
// POST File
router.post('/upload-book', upload.single('book'), function (req, res) {
  if (!req.file) {
    return res.send({
      success: false
    });

  } else {
    let filename = req.file.filename;
    return res.send({
      success: true,
      filename: filename
    })
  }
});
// POST File
router.post('/upload-material', upload.single('material'), function (req, res) {
  if (!req.file) {
    return res.send({
      success: false
    });

  } else {
    let filename = req.file.filename;
    return res.send({
      success: true,
      filename: filename
    })
  }
});

router.use('/user', isLoggedIn, require('./user'));
router.get('/getDashboardData', isLoggedIn, user.getDashboardData);
router.get('/', isLoggedIn, user.index);

router.post('/signup', user.signup);
router.post('/login', user.login);
router.post('/forgot-pwd', user.forgotPwd);
router.post('/reset-pwd', user.resetPwd);
router.post('/upload-background', isLoggedIn, user.uploadBackground);
router.post('/upload-logo', isLoggedIn, user.uploadLogo)
router.get('/images/:filename', (req, res) => {
  try {
    let path = process.cwd() + '/uploads/' + req.params.filename;
    res.sendFile(path);
  } catch (error) {
    res.send("");
  }
});
router.get('/books/:filename', (req, res) => {
  try {
    let path = process.cwd() + '/uploads/' + req.params.filename;
    res.sendFile(path);
  } catch (error) {
    res.send("");
  }
});
router.get('/materials/:filename', (req, res) => {
  try {
    let path = process.cwd() + '/uploads/' + req.params.filename;
    res.sendFile(path);
  } catch (error) {
    res.send("");
  }
});

router.get('/assignment/:filename', (req, res) => {
  try {
    let path = process.cwd() + '/uploads/' + req.params.filename;
    res.sendFile(path);
  } catch (error) {
    res.send("");
  }
});

router.get('/homeworks/:filename', (req, res) => {
  try {
    let path = process.cwd() + '/uploads/' + req.params.filename;
    res.sendFile(path);
  } catch (error) {
    res.send("");
  }
});
router.get('/getConfig', isLoggedIn, user.getConfig);

router.get('/getActivities', isLoggedIn, user.getActivities);
router.use('/setup', isLoggedIn, require('./setup'));
router.use('/todos', isLoggedIn, require('./todos'));
router.use('/student', isLoggedIn, require('./student'));
router.use('/followup', isLoggedIn, require('./followup'));
router.use('/appointment', isLoggedIn, require('./appointment'));
router.use('/events', isLoggedIn, require('./events'));
router.use('/lectures', isLoggedIn, require('./lecture'));
router.use('/skills', isLoggedIn, require('./skill'));
router.use('/locations', isLoggedIn, require('./location'));
router.use('/classes', isLoggedIn, require('./class'));
router.use('/schedule', isLoggedIn, require('./schedule'));
router.use('/assignments', isLoggedIn, require('./assignment'));
router.use('/curriculums', isLoggedIn, require('./curriculum'));
router.use('/homework', isLoggedIn, require('./homework'));
router.use('/homeworkgrades', isLoggedIn, require('./homeworkgrade'));
router.use('/issue', isLoggedIn, require('./issue'));
router.use('/bookstore', isLoggedIn, require('./bookstore'));
router.use('/account', isLoggedIn, require('./account'));
router.use('/authorize', isLoggedIn, require('./authorize'));
router.use('/material', isLoggedIn, require('./material'));
router.use('/attendance', isLoggedIn, require('./attendance'));
router.use('/classCurriculum', isLoggedIn, require('./classcurriculum'));
router.use('/hr', isLoggedIn, require('./hr'));
router.use('/fee', isLoggedIn, require('./fee'));
router.use('/holiday', isLoggedIn, require('./holiday'));
//router.use('/admissions', isLoggedIn, require('./admission'));

router.use('/download/:token', downloadAuth, require('./download'));
router.use('/chathistory/:room_id', isLoggedIn, chat_history.getChatHistoryByRoom)
router.use('/exam', isLoggedIn, require('./exam'));


function isLoggedIn(req, res, next) {
  try {
    let headerToken = req.headers.authorization;
    headerToken = headerToken.replace('Bearer ', '').trim();
    let jwtSecretKey = process.env.JWT_SECRET;
    let jwtAlgorithm = {
      algorithms: process.env.JWT_ALGORITHM
    };
    jwt.verify(headerToken, jwtSecretKey, jwtAlgorithm, (err, decoded) => {
      if (err) {
        res.status(401).json({
          status: false,
          message: 'Unauthorized'
        });
      } else {
        User.findOne({
          user_id: decoded.user_id
        }, (err, userData) => {
          if (userData) {
            req.headers.user_id = userData.user_id;
            req.headers.school_id = userData.school_id ? userData.school_id : req.headers._id;
            req.headers.user_name = userData.personal_info.first_name;
            req.headers.user_email = userData.email;
            req.headers._id = userData._id;

            req.headers.owner_id = (userData.created_by ? userData.created_by.user_id : '')
            req.headers.user_role = (userData.role_id ? userData.role_id : '');

            next();
          } else {
            res.status(401).json({
              status: false,
              message: 'Unauthorized'
            });
          }
        })

      }
    });
  } catch (error) {
    res.status(401).json({
      status: false,
      message: 'Unauthorized'
    });
  }

}

function downloadAuth(req, res, next) {
  try {
    let {
      token
    } = req.params;
    let jwtSecretKey = process.env.JWT_SECRET;
    let jwtAlgorithm = {
      algorithms: process.env.JWT_ALGORITHM
    };
    jwt.verify(token, jwtSecretKey, jwtAlgorithm, (err, decoded) => {
      if (err) {
        res.status(401).send("Authentication Error");
      } else {
        User.findOne({
          user_id: decoded.user_id
        }, (err, userData) => {
          if (userData) {
            req.headers.user_id = userData.user_id;
            req.headers.user_name = userData.first_name;
            req.headers.user_email = userData.email;
            req.headers.school_id = userData.school_id;
            next();
          } else {
            res.status(401).send("Authentication Error");
          }
        })

      }
    });
  } catch (error) {
    res.status(401).send("Authentication Error");
  }

}

module.exports = router;