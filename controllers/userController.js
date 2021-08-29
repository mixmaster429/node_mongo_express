const User = require('../models/users');
const Departments = require('../models/department');
const eventsModel = require('../models/events');
const RoleModel = require('../models/roles');
const emailLogsModel = require('../models/emailLogs');
const smsLogsModel = require('../models/smsLogs');
const StudentModel = require('../models/student');
const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const { getActivities, saveActivity } = require('./activityUtil');
const { sendMail } = require('./mailUtil');
const { sendSMS } = require('./smsUtil');
const db = require('../db').queries;
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

class userController {
  constructor() {}

  async index(req, res) {
    console.log('yes');
    let user = await User.findOne({
      user_id: req.headers.user_id,
    });
    let roleName = await RoleModel.findOne({
      _id: ObjectId(user.role_id).toString(),
    });
    res.json({
      status: true,
      result: user,
      role: roleName.name,
      role_weight: roleName.weight,
    });
  }

  async getDashboardData(req, res) {
    let { user_id, school_id, user_role, _id } = req.headers;

    let role = await RoleModel.findOne({
      $or: [
        {
          _id: user_role,
        },
        {
          id: user_role,
        },
      ],
    });
    let recentStudent;
    let userCount = await User.countDocuments({
      school_id: school_id,
    });
    let student_enrolled = await StudentModel.countDocuments({
      school_id: school_id,
    });
    let recentUser = await User.findOne({
      school_id: school_id,
    }).sort({
      created_at: -1,
    });
    let event = await eventsModel
      .findOne({
        school_id: school_id,
      })
      .sort({
        created_at: -1,
      });
    let email = await emailLogsModel.findOne({}).sort({
      created_at: -1,
    });
    let sms = await smsLogsModel.findOne({}).sort({
      created_at: -1,
    });
    let data = {
      student_enrolled: student_enrolled,
      departments: 0,
      users_enrolled: userCount,
      payment_received: 0,
      recentStudent: {
        name: 'Carl Whethers',
        photo: '',
        email: 'carlawhethers@gmail.com',
        phone: '0987654321',
        date: 'Feb 10 2021',
      },
      recentUser: {},
      event: {
        date: '5/21/2021',
        address: 'San Fransico 94112, California, United State',
      },
      sms: [],
      email: {
        to: 'alexander@gmail.com',
        status: true,
        subject: 'Assignment Status',
      },
    };
    let districtUser = false;
    // console.log(role.weight)
    if (role.weight == 0) {
      let rolesDistricts = (
        await RoleModel.find({
          weight: 1,
        }).select('_id')
      ).map((item) => item._id);
      let rolesSchools = (
        await RoleModel.find({
          weight: 3,
        }).select('_id')
      ).map((item) => item._id);
      let users = await User.find({
        role_id: {
          $in: rolesDistricts,
        },
        'created_by.user_id': user_id,
      });
      let privateschools = await User.find({
        role_id: {
          $in: rolesSchools,
        },
        'created_by.user_id': user_id,
      });
      // let privateschools = await User.find({'created_by.user_id': user_id});

      districtUser = true;
      data.districts = users;
      data.recentStudent = users[users.length - 1];
      if (privateschools.length >= 1) data.recentUser = privateschools[privateschools.length - 1];
      else data.recentUser = {};
      data.schools = privateschools;
      data.students = 0;
    } else if (role.weight == 1 || role.weight == 2) {
      //  let rolesDistricts = (await RoleModel.find({weight: 2}).select('_id')).map((item)=> item._id);
      let rolesDistrictStaffs = (
        await RoleModel.find({
          weight: 2,
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let rolesSchools = (
        await RoleModel.find({
          weight: 3,
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);

      //  let users = await User.find({role_id: {$in: rolesDistricts},'created_by.user_id': user_id});
      let schools = await User.find({
        role_id: {
          $in: rolesSchools,
        },
        'created_by.user_id': user_id,
      });

      let districtStaffId = (
        await User.find({
          role_id: {
            $in: rolesDistrictStaffs,
          },
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);

      //schoolsId = ["605e3245aa0ffb1054cbc945"]

      let students = await User.countDocuments({
        school_id: {
          $in: districtStaffId,
        },
      });

      // get staff unders district schools

      let roleSchools = (
        await RoleModel.find({
          weight: 3,
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let rolesnotParentnotStudent = (
        await RoleModel.find({
          weight: {
            $in: [5, 6],
          },
        }).select('_id')
      ).map((item) => item._id);

      let schoolsIdd = (
        await User.find({
          role_id: {
            $in: roleSchools,
          },
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);

      let staffs = await User.find({
        role_id: {
          $nin: rolesnotParentnotStudent,
        },
        school_id: {
          $in: schoolsIdd,
        },
      });

      // get staff unders ditrict schools ends

      // get Recent School

      let rolesSchoolLast = await RoleModel.findOne({
        weight: 3,
        'created_by.user_id': user_id,
      }).sort({
        created_at: -1,
      });
      let recentSchool = null;
      if (rolesSchoolLast) {
        recentSchool = await User.findOne({
          role_id: rolesSchoolLast._id,
          'created_by.user_id': user_id,
        }).sort({
          created_at: -1,
        });
      }
      // get Recent School Ends

      districtUser = true;
      data.recentStudent = recentSchool; // recent School
      data.recentUser = staffs[staffs.length - 1]; // recent Staff
      data.users_enrolled = staffs.length;
      data.schools = schools;
      data.students = students;
    } else if (role.weight == 3) {
      console.log('3');
      districtUser = true;
      let rolesStudents = (
        await RoleModel.find({
          weight: 5,
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let students = await User.countDocuments({
        role_id: {
          $in: rolesStudents,
        },
        'created_by.user_id': user_id,
      });

      let rolesUsers = (
        await RoleModel.find({
          $and: [
            {
              weight: {
                $gt: role.weight,
              },
            },
            {
              weight: {
                $nin: [5, 6],
              },
            },
          ],
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let userCount = await User.countDocuments({
        role_id: {
          $in: rolesUsers,
        },
        'created_by.user_id': user_id,
      });

      let schoolStudentRole = await RoleModel.findOne({
        weight: 5,
        'created_by.user_id': user_id,
      });

      if (!schoolStudentRole) {
        recentStudent = {};
      } else {
        recentStudent = await User.findOne({
          role_id: schoolStudentRole._id,
          'created_by.user_id': user_id,
        }).sort({
          created_at: -1,
        });
      }

      let schoolStaffRoles = (
        await RoleModel.find({
          weight: {
            $in: [4, 7, 8, 9],
          },
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let recentStaff = await User.findOne({
        role_id: {
          $in: schoolStaffRoles,
        },
        'created_by.user_id': user_id,
      }).sort({
        created_at: -1,
      });
      data.departments = await Departments.count({
        'created_by.user_id': user_id,
      });
      data.districts = [];
      data.schools = [];
      data.students = students;
      data.users_enrolled = userCount;

      data.recentStudent = recentStudent;
      data.recentUser = recentStaff;
    } else if (role.weight == 5) {
      districtUser = true;

      let user = await User.findOne({
        _id: _id,
      });

      let roleStudent = await RoleModel.findOne({
        weight: 5,
        'created_by.user_id': user.created_by.user_id,
      });
      if (!roleStudent) {
        recentStudent = {};
      } else {
        recentStudent = await User.findOne({
          role_id: roleStudent._id,
          'created_by.user_id': roleStudent.created_by.user_id,
        }).sort({
          created_at: -1,
        });
      }

      data.recentStudent = recentStudent; // recent Student

      let roleStaff = (
        await RoleModel.find({
          weight: {
            $in: [4, 6, 7, 8, 9],
          },
          'created_by.user_id': user.created_by.user_id,
        }).select('_id')
      ).map((item) => item._id);

      recentUser = await User.findOne({
        role_id: {
          $in: roleStaff,
        },
        'created_by.user_id': user.created_by.user_id,
      }).sort({
        created_at: -1,
      });

      data.recentUser = recentUser; // recent Staff
    } else if (role.weight == 4 || role.weight == 7 || role.weight > 7) {
      districtUser = true;
      let staffLoggedIn = await User.findOne({
        _id,
      });
      let roleStaff = await RoleModel.findOne({
        _id: staffLoggedIn.role_id,
      });
      let SchoolOfStaff = await User.findOne({
        user_id: roleStaff.created_by.user_id,
      });
      user_id = roleStaff.created_by.user_id;

      let rolesStudents = (
        await RoleModel.find({
          weight: 5,
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let students = await User.countDocuments({
        role_id: {
          $in: rolesStudents,
        },
        'created_by.user_id': user_id,
      });

      let rolesUsers = (
        await RoleModel.find({
          $and: [
            {
              weight: {
                $gt: 3,
              },
            },
            {
              weight: {
                $nin: [5, 6],
              },
            },
          ],
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let userCount = await User.countDocuments({
        role_id: {
          $in: rolesUsers,
        },
        'created_by.user_id': user_id,
      });

      let schoolStudentRole = await RoleModel.findOne({
        weight: 5,
        'created_by.user_id': user_id,
      });

      if (!schoolStudentRole) {
        recentStudent = {};
      } else {
        recentStudent = await User.findOne({
          role_id: schoolStudentRole._id,
          'created_by.user_id': user_id,
        }).sort({
          created_at: -1,
        });
      }

      let schoolStaffRoles = (
        await RoleModel.find({
          weight: {
            $in: [4, 7, 8, 9],
          },
          'created_by.user_id': user_id,
        }).select('_id')
      ).map((item) => item._id);
      let recentStaff = await User.findOne({
        role_id: {
          $in: schoolStaffRoles,
        },
        'created_by.user_id': user_id,
      }).sort({
        created_at: -1,
      });
      data.departments = await Departments.count({
        'created_by.user_id': user_id,
      });
      data.districts = [];
      data.schools = [];
      data.students = students;
      data.users_enrolled = userCount;

      data.recentStudent = recentStudent;
      data.recentUser = recentStaff;
    } else {
      data.districts = [];
      data.schools = [];
      data.students = 0;
    }
    if (!districtUser && recentUser) {
      data.recentUser = {
        name: recentUser.personal_info.first_name + ' ' + recentUser.personal_info.last_name,
        photo: recentUser.personal_info.profile_image,
        email: recentUser.email,
        phone: recentUser.contact_info.phone,
        date: new Date(recentUser.created_at).toDateString(),
      };
    }
    if (event) {
      data.event = {
        date: event.start_date,
        address: event.address1,
      };
    }
    if (email) {
      data.email = {
        to: email.to,
        status: email.status === 'success' ? true : false,
        subject: email.subject,
      };
    }
    if (sms) {
    }
    res.json({
      status: true,
      result: data,
    });
  }

  async loadPermission(req, res) {
    let { user_role } = req.headers;
    let role = await RoleModel.findOne({
      _id: ObjectId(user_role).toString(),
    });

    res.json({
      status: true,
      result: role,
    });
  }

  async signup(req, res) {
    let { email, password } = req.body; // can be added more fields.
    if (!email || !password) {
      res.status(400).json({
        status: false,
        message: 'Request parameters are not valid.',
      });
    } else {
      email = email.toLowerCase();
      User.findOne(
        {
          email: email,
        },
        (err, user) => {
          if (user) {
            res.status(400).json({
              status: false,
              message: 'This email is already taken.',
            });
          } else {
            let newUser = new User();
            newUser.user_id = shortid.generate();
            newUser.email = email;
            // newUser.password = newUser.generateHash(password);
            newUser.password = password;
            newUser.created_at = Date.now();
            newUser.updated_at = Date.now();
            newUser.save((err) => {
              if (err)
                res.status(500).json({
                  status: false,
                  message: 'Cannot save new user.',
                });
              else {
                res.status(200).json({
                  status: true,
                  message: 'successfully added new user',
                  user: {
                    email: newUser.email,
                    user_id: newUser.user_id,
                  },
                });
              }
            });
          }
        }
      );
    }
  }

  login(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    if (!email || !password) {
      res.status(400).json({
        status: false,
        message: 'Request parameters are not valid.',
      });
    } else {
      email = email.toLowerCase();
      User.findOne(
        {
          email: email,
        },
        (err, user) => {
          if (err)
            res.status(500).json({
              status: false,
              message: 'Database error.',
            });
          else {
            if (user) {
              // if (!user.validPassword(password)) {
              if (user.password != password) {
                res.status(400).json({
                  status: false,
                  message: 'Wrong Password.',
                });
              } else if (!user.active) {
                const msg = {
                  to: email,
                  from: process.env.FROM_EMAIL,
                  subject: 'Reset Your Password',
                  html: 'Your account has been deactivated, contact your school administrator for help',
                };
                sendMail(user.user_id, user.personal_info.first_name, msg);
                res.status(400).json({
                  status: false,
                  message:
                    'Your account has been deactivated, contact your school administrator for help',
                });
              } else {
                let jwtSignData = {
                  user_id: user.user_id,
                };
                let jwtSignOptions = {
                  expiresIn: process.env.JWT_EXPIRETIME,
                  algorithm: process.env.JWT_ALGORITHM,
                };
                let authToken = jwt.sign(jwtSignData, process.env.JWT_SECRET, jwtSignOptions);
                res.status(200).json({
                  status: true,
                  token: authToken,
                  email: user.email,
                  user_id: user.user_id,
                });
              }
            } else {
              res.status(400).json({
                status: false,
                message: 'Email does not exist.',
              });
            }
          }
        }
      );
    }
  }

  async forgotPwd(req, res) {
    try {
      let { user_id, user_name } = req.headers;
      let { email } = req.body;
      email;
      let user = await User.findOne({
        email: email,
      });
      if (user) {
        require('crypto').randomBytes(48, async function (err, buffer) {
          var token = buffer.toString('hex');
          user.token = {
            token: token,
            expire_time: Date.now() + 60 * 60 * 1000,
          };
          await user.save();
          let url = `${process.env.SITE_URL}/reset-pwd/${email}/${token}`;
          ejs.renderFile(
            process.cwd() + '/views/resetpwd.ejs',
            {
              url: url,
            },
            async (err, data) => {
              console.log(data);
              if (err) {
                console.log(err);
              } else {
                if (user.contact_info.phone) {
                  const sms = {
                    body: `Password Reset url: ${url}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.contact_info.phone,
                  };
                  await sendSMS(sms);
                }
                const msg = {
                  to: email,
                  from: process.env.FROM_EMAIL,
                  subject: 'Reset Your Password',
                  html: data,
                };
                await sendMail(user_id, user_name, msg);
              }
            }
          );
          res.status(200).json({
            status: true,
            message: 'The reset password request has been sent successfully!',
          });
        });
      } else {
        res.json({
          status: false,
          message: 'Email does not exit.',
        });
      }
    } catch (error) {
      res.json({
        status: false,
        message: 'Server Error',
      });
    }
  }

  async resetPwd(req, res) {
    let { email, token, password } = req.body;
    if (password == '' || token == '' || email == '') {
      res.status(200).json({
        status: false,
        message: 'Bad Request',
      });
    } else {
      email = email.toLowerCase();
      let user = await User.findOne({
        email: email,
      });
      if (user && user.email == email) {
        if (user.token && user.token.token == token && user.token.expire_time > Date.now()) {
          // user.password = user.generateHash(password);
          user.password = password;
          user.token = {};
          await user.save();
          res.status(200).json({
            status: true,
          });
        } else {
          res.json({
            status: false,
            message: 'Token is not existing or expired.',
          });
        }
      } else {
        res.status(200).json({
          status: false,
          message: 'The requested user does not exit.',
        });
      }
    }
  }

  async uploadBackground(req, res) {
    let { image } = req.body;
    let { user_id } = req.headers;
    await User.updateOne(
      {
        user_id: user_id,
      },
      {
        background_image: image,
      }
    );
    res.json({
      status: true,
    });
  }

  async uploadLogo(req, res) {
    let { logo_image, school_name } = req.body;
    let { school_id } = req.headers;
    await User.updateOne(
      {
        _id: school_id,
      },
      {
        school_name: school_name,
        logo_image: logo_image,
      }
    );
    res.json({
      status: true,
    });
  }

  async getConfig(req, res) {
    console.log('get config');
    let { school_id } = req.headers;
    let userData = await User.findOne({
      _id: school_id,
    });
    res.json({
      status: true,
      result: {
        background: userData.background_image,
        logo_image: userData.logo_image,
        school_name: userData.school_name,
      },
    });
  }

  async getActivities(req, res) {
    let activities = await getActivities(req);
    res.json({
      status: true,
      result: activities,
    });
  }

  async createAdmin(req, res) {
    try {
      let { userData } = req.body;
      let { user_id, user_name } = req.headers;
      let email = userData.email;
      let existing = await User.findOne({
        email: email,
      });
      if (existing) {
        res.json({
          status: false,
          message: 'This user already exists. Pleast try with another email address.',
        });
      } else {
        await User.create({
          ...userData,
          user_id: shortid.generate(),
          created_at: Date.now(),
          created_by: {
            name: user_name,
            user_id: user_id,
          },
        });
        saveActivity(user_id, user_name, 'User', 'A user has been created', 'created');
        res.json({
          status: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async updateAdmin(req, res) {
    try {
      let { userData, id } = req.body;
      let { user_id, user_name, _id } = req.headers;
      // let school_id = userData.school_id ? userData.school_id : _id
      await User.updateOne(
        {
          user_id: id,
        },
        {
          $set: {
            ...userData,
            updated_at: Date.now(),
            updated_by: {
              name: user_name,
              user_id: user_id,
            },
          },
        }
      );
      saveActivity(user_id, user_name, 'User', 'A user has been updated', 'updated');
      res.json({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async promoteStudent(req, res) {
    try {
      let { year, session, grade, _id } = req.body;
      let { user_id, user_name } = req.headers;

      await User.updateOne(
        {
          _id: _id,
        },
        {
          $set: {
            academic_year_id: year,
            standard_grade_id: grade,
            session_id: session,

            updated_at: Date.now(),
            updated_by: {
              name: user_name,
              user_id: user_id,
            },
          },
        }
      );
      saveActivity(user_id, user_name, 'Student', 'A student has been promoted', 'updated');
      res.json({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async updateStaff(req, res) {
    try {
      let { userData, id } = req.body;
      let { user_id, user_name, _id } = req.headers;
      let school_id = userData.school_id ? userData.school_id : _id;
      await User.updateOne(
        {
          user_id: id,
        },
        {
          $set: {
            email: userData.email,
            school_id: school_id,
            password: userData.password,
            role_id: userData.role_id,
            personal_info: userData.personal_info,
            contact_info: userData.contact_info,
            physical_info: userData.physical_info,
            logo_image: userData.logo_image,
            social_media_links: userData.social_media_links,
            emergency_contact: userData.emergency_contact,
            updated_at: Date.now(),
            updated_by: {
              name: user_name,
              user_id: user_id,
            },
          },
        }
      );
      saveActivity(user_id, user_name, 'User', 'A user has been updated', 'updated');
      res.json({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async createStaff(req, res) {
    try {
      let { userData } = req.body;

      let { user_id, user_name, _id } = req.headers;
      let school_id = userData.school_id ? userData.school_id : _id;
      let email = userData.email;
      let existing = await User.findOne({
        email: email,
      });
      if (existing) {
        res.json({
          status: false,
          message: 'This user already exists. Pleast try with another email address.',
        });
      } else {
        await User.create({
          user_id: shortid.generate(),
          email: userData.email,
          password: userData.password,
          role_id: userData.role_id,
          school_id: school_id,
          personal_info: userData.personal_info,
          contact_info: userData.contact_info,
          physical_info: userData.physical_info,
          social_media_links: userData.social_media_links,
          emergency_contact: userData.emergency_contact,
          created_at: Date.now(),
          created_by: {
            name: user_name,
            user_id: user_id,
          },
        });
        saveActivity(user_id, user_name, 'User', 'A user has been created', 'created');
        res.json({
          status: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async getStaffUnderSchoolsDistricts(req, res) {
    let { user_role, user_email, user_id } = req.headers;

    let roleSchools = (
      await RoleModel.find({
        weight: 3,
        'created_by.user_id': user_id,
      }).select('_id')
    ).map((item) => item._id);
    let rolesnotParentnotStudent = (
      await RoleModel.find({
        weight: {
          $in: [5, 6],
        },
      }).select('_id')
    ).map((item) => item._id);

    let schoolsId = (
      await User.find({
        role_id: {
          $in: roleSchools,
        },
        'created_by.user_id': user_id,
      }).select('_id')
    ).map((item) => item._id);
    console.log(schoolsId);
    let staffs = await User.find({
      role_id: {
        $nin: rolesnotParentnotStudent,
      },
      school_id: {
        $in: schoolsId,
      },
    });

    res.json({
      status: true,
      result: staffs,
    });
  }

  async getStaffUnderSchool(req, res) {
    let { user_role, user_email, user_id, _id } = req.headers;

    //let roleSchools = (await RoleModel.find({ weight:3,"created_by.user_id":user_id}).select('_id')).map((item)=> item._id);
    let rolesnotParentnotStudent = (
      await RoleModel.find({
        'created_by.user_id': user_id,
        $and: [
          {
            weight: {
              $gt: 3,
            },
          },
          {
            weight: {
              $nin: [5, 6],
            },
          },
        ],
      }).select('_id')
    ).map((item) => item._id);

    let staffs = await User.find({
      role_id: {
        $in: rolesnotParentnotStudent,
      },
    });

    res.json({
      status: true,
      result: staffs,
    });
  }

  async getSchoolsUnderDistrict(req, res) {
    let { user_role, user_email, user_id } = req.headers;

    let roleSchools = (
      await RoleModel.find({
        weight: 3,
      }).select('_id')
    ).map((item) => item._id);

    let schools = await User.find({
      role_id: {
        $in: roleSchools,
      },
      'created_by.user_id': user_id,
    });

    //  let staffs = await User.find({  $not: { role_id: { $eq: roleStudent._id }},   school_id:{$in:schoolsId}});

    res.json({
      status: true,
      result: schools,
    });
  }

  async getAdmins(req, res) {
    let { user_role, user_email, user_id, owner_id } = req.headers;
    console.log(user_id);
    let role = await RoleModel.findOne({
      $or: [
        {
          _id: user_role,
        },
        {
          id: user_role,
        },
      ],
    });
    if (role) {
      if (role.weight === 0) {
        let roles = (
          await RoleModel.find({
            weight: {
              $in: [1, 3],
            },
          }).select('_id')
        ).map((item) => item._id);
        let users = await User.find({
          role_id: {
            $in: roles,
          },
          'created_by.user_id': user_id,
        });

        res.json({
          status: true,
          result: users,
        });
      } else if (role.weight <= 2) {
        let roles = (
          await RoleModel.find({
            weight: {
              $gt: role.weight,
            },
          }).select('_id')
        ).map((item) => item._id);
        let users = await User.find({
          role_id: {
            $in: roles,
          },
          'created_by.user_id': user_id,
        });
        let ids = users.map((item) => item.id);
        let subs = await User.find({
          role_id: {
            $in: roles,
          },
          'created_by.user_id': {
            $in: ids,
          },
        });

        users = users.concat(subs);

        res.json({
          status: true,
          result: users,
        });
      } else if (role.weight === 3) {
        let roles = (
          await RoleModel.find({
            $or: [
              {
                weight: 6,
              },
              {
                weight: 5,
              },
            ],
          }).select('_id')
        ).map((item) => item._id);
        let users = await User.find({
          role_id: {
            $in: roles,
          },
          'created_by.user_id': user_id,
        });

        res.json({
          status: true,
          result: users,
        });
      } else if (!isNaN(role.weight + 1)) {
        let roles = (
          await RoleModel.find({
            weight: {
              $gt: role.weight,
            },
          }).select('_id')
        ).map((item) => item._id);
        let users = await User.find({
          role_id: {
            $in: roles,
          },
          'created_by.user_id': owner_id,
        });

        res.json({
          status: true,
          result: users,
        });
      } else {
        res.json({
          status: true,
          result: [],
        });
      }
    } else {
      res.json({
        status: true,
        result: [],
      });
    }
  }

  async makeStudent(req, res) {
    let { id } = req.body;
    let confirm = req.body.is_confirm ? '1' : '0';
    let { user_id, user_name, _id } = req.headers;
    try {
      let roleParent = await RoleModel.findOne({
        weight: 6,
        'created_by.user_id': user_id,
      }); // weight for a Parent is 6
      if (!roleParent) {
        res.json({
          status: false,
          message: 'Please create a new role which role weight is 6 for parents',
        });
        return;
      }

      let role = await RoleModel.findOne({
        weight: 5,
        'created_by.user_id': user_id,
      }); // weight for a student is 5
      if (!role) {
        res.json({
          status: false,
          message: 'Please create a new role which role weight is 5 for students',
        });
        return;
      }
      if (roleParent && role) {
        await StudentModel.updateOne(
          {
            _id: id,
          },
          {
            $set: {
              is_confirm: confirm,
              updated_at: Date.now(),
              updated_by: {
                user_id: user_id,
                user_name: user_name,
              },
            },
          }
        );
        saveActivity(
          user_id,
          user_name,
          'Admission',
          'An Admission has been confirmed.',
          'Confirmed'
        );
      }
      let user = await StudentModel.findOne({
        _id: id,
      });
      let school = await User.findOne({
        user_id: user_id,
      });

      let newUser = new User();
      newUser.user_id = shortid.generate();
      let student_user_id = newUser.user_id;
      newUser.email = user.email;
      // newUser.password = newUser.generateHash(password);
      // newUser.password = "123456";
      newUser.created_at = Date.now();
      //newUser.updated_at = Date.now();

      // newUser.role_id = "776425a6489a5dea266da9e928b9fe08" // static for now will change that // Student
      newUser.role_id = role._id; // static for now will change that // Student
      // newUser.school_name = "Socrates" // static for now will change that
      newUser.school_name = school.school_name; // static for now will change that
      newUser.token = {}; // static for now will change that
      newUser.active = false; // static for now will change that
      newUser.school_id = user.school_id;
      newUser.personal_info = {
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        gender: user.gender_id,
        birth_date: user.birth_date,
      };
      newUser.contact_info = {
        phone: user.phone,
        //  office_address:
        address1: user.address.address_1,
        address2: user.address.address_2,
        country: user.address.country,
        state: user.address.state,
        city: user.address.city,
        zip_code: user.address.zipcode,
      };

      newUser.physical_info = {
        height: user.medical.height,

        weight: user.medical.weight,

        blood: user.medical.blood_group_id,
        medical_immunizations: user.medical.medical_immunizations,
        medical_allergies: user.medical.medical_allergies,
        physical_handicaps: user.medical.physical_handicaps,
        other_medical_info: user.medical.other_medical_info,
        social_behavioral: user.medical.social_behavioral,
      };

      newUser.standard_grade_id = user.standard_grade_id;
      newUser.session_id = user.session_id;
      newUser.academic_year_id = user.academic_year_id;
      newUser.logo_image = user.image;

      newUser.created_by = {
        user_id: user_id,
        user_name: user_name,
      };

      newUser.save((err) => {
        if (err)
          res.status(500).json({
            status: false,
            message: 'Cannot save new user.',
          });
        else {
          let newParent = new User();
          newParent.user_id = shortid.generate();
          newParent.email = user.parent_email;
          // newUser.password = newUser.generateHash(password);
          //newParent.password = "123456";
          newParent.created_at = Date.now();
          //newUser.updated_at = Date.now();

          newParent.role_id = roleParent._id; // static for now will change that // Parent
          //newParent.role_id = "ebaf8470e2a1a22b84fe38ec55143c32" // static for now will change that // Parent
          // newParent.school_name = "Socrates" // static for now will change that
          newParent.school_id = user.school_id;
          newParent.token = {}; // static for now will change that
          newParent.active = false; // static for now will change that
          newParent.personal_info = {
            first_name: user.parent_name,
            //gender:user.gender_id,
            //  birth_date:user.birth_date
          };
          newParent.contact_info = {
            phone: user.parent_phone,
            //  office_address:
            address1: user.address.parent_address,
            //  address2:user.address.address2,
            country: user.address.country,
            state: user.address.state,
            city: user.address.city,
            zip_code: user.address.zip_code,
          };

          newParent.standard_grade_id = user.standard_grade_id;
          newParent.session_id = user.session_id;
          newParent.academic_year_id = user.academic_year_id;
          newParent.logo_image = user.image;
          (newParent.student.first_name = user.first_name),
            (newParent.student.middle_name = user.middle_name),
            (newParent.student.last_name = user.last_name),
            (newParent.student_id = student_user_id),
            (newParent.created_by = {
              user_id: user_id,
              user_name: user_name,
            });
          newParent.save((err) => {
            if (err)
              res.status(500).json({
                status: false,
                message: 'Cannot save new user.',
              });
            else {
              res.status(200).json({
                status: true,
                message: 'successfully added new user',
                user: {
                  email: newUser.email,
                  user_id: newUser.user_id,
                },
              });
            }
          });
        }
      }); // res.json({ status: true });
    } catch (error) {
      //  console.log(error)
      res.json({
        status: false,
        message: 'Please add role of either student or parent first',
      });
    }
  }

  async getTeachers(req, res) {
    let { user_id } = req.headers;
    let role = await RoleModel.findOne({
      weight: 4,
      'created_by.user_id': user_id,
    });
    if (!role || !role._id) {
      res.json({
        status: false,
        message: 'Cannot find user with role 4 i.e Teacher',
      });
    } else {
      let users = await User.find({
        role_id: role._id,
        'created_by.user_id': user_id,
      }); // static for now will change
      res.json({
        status: true,
        result: users,
      });
    }
  }

  async getStudents(req, res) {
    let { user_id } = req.headers;
    let lookUp = {};
    let unwindSessions = {};

    let lookUp1 = {};
    let unwindGrades = {};

    let lookUp2 = {};
    let unwindSchool = {};

    let match = {};
    let confirm = req.params.is_confirm == 'true' ? '1' : '0';
    let role = await RoleModel.findOne({
      weight: 5,
      'created_by.user_id': user_id,
    });

    if (!role) {
      res.json({
        status: false,
        result: [],
        message: 'Please add user with role 5 i.e Student',
      });
      return;
    }

    match = {
      $match: {
        //role_id: "776425a6489a5dea266da9e928b9fe08", // static for now will change
        role_id: ObjectId(role._id).toString(), // static for now will change
        'created_by.user_id': user_id,
      },
    };
    console.log(ObjectId(role._id).toString() + 'sfsdf');

    let addFields = {
      $addFields: {
        sessionObjectId: {
          $toObjectId: '$session_id',
        },
      },
    };
    lookUp = {
      $lookup: {
        from: 'sessionmodels',
        localField: 'sessionObjectId',
        foreignField: '_id',
        as: 'sessionData',
      },
    };

    unwindSessions = {
      $unwind: {
        path: '$sessionData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let addFields1 = {
      $addFields: {
        gradeObjectId: {
          $toObjectId: '$standard_grade_id',
        },
      },
    };

    lookUp1 = {
      $lookup: {
        from: 'schoolgradesmodels',
        localField: 'gradeObjectId',
        foreignField: '_id',
        as: 'gradeData',
      },
    };

    unwindGrades = {
      $unwind: {
        path: '$gradeData',
        preserveNullAndEmptyArrays: true,
      },
    };

    // let addFields2 =  { "$addFields": { "gradeObjectId": { "$toObjectId": "$standard_grade_id" }}}

    lookUp2 = {
      $lookup: {
        from: 'users',
        localField: 'created_by.user_id',
        foreignField: 'user_id',
        as: 'schoolData',
      },
    };

    unwindSchool = {
      $unwind: {
        path: '$schoolData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let project = {
      $project: {
        _id: 1,
        contact_info: 1,
        personal_info: 1,
        physical_info: 1,
        image: 1,
        inquiry_status_id: 1,
        source_id: 1,
        source_details: 1,
        user_id: 1,

        email: 1,
        logo_image: 1,
        active: 1,

        created_at: 1,
        created_by: 1,

        'session._id': 1,
        'session.id': 1,
        'session.name': 1,
        //  "grade._id": 1,
        //"grade.id": 1,
        'grade._id': 1,
        'grade.name': 1,

        //"grade": 1,
        //  "grade.id": 1,
        school_id: 1,
        schoolName: 1,
        credentials: {
          $cond: {
            if: {
              $eq: ['$password', ''],
            },
            then: 'No',
            else: 'Yes',
          },
        },
      },
    };

    let group = {
      $group: {
        _id: '$_id',
        image: {
          $first: '$image',
        },
        contact_info: {
          $first: '$contact_info',
        },
        personal_info: {
          $first: '$personal_info',
        },
        physical_info: {
          $first: '$physical_info',
        },
        logo_image: {
          $first: '$logo_image',
        },
        user_id: {
          $first: '$user_id',
        },
        school_id: {
          $first: '$school_id',
        },
        // inquiry_date:{$first:"$inquiry_date"},
        // inquiry_status_id:{$first:"$inquiry_status_id"},
        // source:{$first:"$source"},
        // source_details:{$first:"$source_details"},
        first_name: {
          $first: '$first_name',
        },
        last_name: {
          $first: '$last_name',
        },
        middle_name: {
          $first: '$middle_name',
        },
        // endTime: {$first:"$endTime"},
        gender_id: {
          $first: '$gender_id',
        },
        medical: {
          $first: '$medical',
        },
        address: {
          $first: '$address',
        },
        birth_date: {
          $first: '$birth_date',
        },
        email: {
          $first: '$email',
        },
        phone: {
          $first: '$phone',
        },

        created_at: {
          $first: '$created_at',
        },
        created_by: {
          $first: '$created_by',
        },
        active: {
          $first: '$active',
        },
        // is_confirm: {$first:"$is_confirm"},

        session: {
          $first: '$sessionData',
        },
        grade: {
          $first: '$gradeData',
        },
        schoolName: {
          $first: '$schoolData.personal_info.first_name',
        },
        credentials: {
          $first: '$credentials',
        },
      },
    };
    let query = [
      match,
      addFields,
      lookUp,
      unwindSessions,
      addFields1,
      lookUp1,
      unwindGrades,
      lookUp2,
      unwindSchool,

      group,
      project,
    ];

    let students = await db.aggregateData(User, query);
    res.json({
      status: true,
      result: students,
    });

    // let students = await User.find({role_id:"776425a6489a5dea266da9e928b9fe08"}); // static for now will change
    //  res.json({ status: true, result: students });
  }

  async getStudent(req, res) {
    let { user_id } = req.headers;
    let lookUp = {};
    let unwindSessions = {};

    let lookUp1 = {};
    let unwindGrades = {};
    let match = {};

    match = {
      $match: {
        _id: ObjectId(req.params.id), // static for now will change
      },
    };

    let addFields = {
      $addFields: {
        sessionObjectId: {
          $toObjectId: '$session_id',
        },
      },
    };
    lookUp = {
      $lookup: {
        from: 'sessionmodels',
        localField: 'sessionObjectId',
        foreignField: '_id',
        as: 'sessionData',
      },
    };

    unwindSessions = {
      $unwind: {
        path: '$sessionData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let addFields1 = {
      $addFields: {
        gradeObjectId: {
          $toObjectId: '$standard_grade_id',
        },
      },
    };

    lookUp1 = {
      $lookup: {
        from: 'schoolgradesmodels',
        localField: 'gradeObjectId',
        foreignField: '_id',
        as: 'gradesData',
      },
    };

    unwindGrades = {
      $unwind: {
        path: '$gradesData',
        preserveNullAndEmptyArrays: true,
      },
    };
    let limit = {
      $limit: 1,
    };

    let project = {
      $project: {
        _id: 1,
        contact_info: 1,
        personal_info: 1,
        physical_info: 1,
        emergency_contact: 1,
        social_media_links: 1,
        role_id: 1,
        image: 1,
        inquiry_status_id: 1,
        source_id: 1,
        source_details: 1,
        user_id: 1,
        skills: 1,

        email: 1,
        logo_image: 1,
        active: 1,

        created_at: 1,
        created_by: 1,

        'session._id': 1,
        'session.id': 1,
        'session.name': 1,

        'grade.name': 1,
        'grade._id': 1,
        'grade.id': 1,
      },
    };

    let group = {
      $group: {
        _id: '$_id',
        image: {
          $first: '$image',
        },
        contact_info: {
          $first: '$contact_info',
        },
        personal_info: {
          $first: '$personal_info',
        },
        physical_info: {
          $first: '$physical_info',
        },
        emergency_contact: {
          $first: '$emergency_contact',
        },
        social_media_links: {
          $first: '$social_media_links',
        },
        logo_image: {
          $first: '$logo_image',
        },
        user_id: {
          $first: '$user_id',
        },
        role_id: {
          $first: '$role_id',
        },
        // inquiry_date:{$first:"$inquiry_date"},
        // inquiry_status_id:{$first:"$inquiry_status_id"},
        // source:{$first:"$source"},
        // source_details:{$first:"$source_details"},
        first_name: {
          $first: '$first_name',
        },
        last_name: {
          $first: '$last_name',
        },
        middle_name: {
          $first: '$middle_name',
        },
        // endTime: {$first:"$endTime"},
        gender_id: {
          $first: '$gender_id',
        },
        medical: {
          $first: '$medical',
        },
        address: {
          $first: '$address',
        },
        birth_date: {
          $first: '$birth_date',
        },
        email: {
          $first: '$email',
        },
        phone: {
          $first: '$phone',
        },

        created_at: {
          $first: '$created_at',
        },
        created_by: {
          $first: '$created_by',
        },
        active: {
          $first: '$active',
        },
        skills: {
          $first: '$skills',
        },
        // is_confirm: {$first:"$is_confirm"},

        session: {
          $first: '$sessionData',
        },
        grade: {
          $first: '$gradesData',
        },
      },
    };
    let query = [
      match,
      addFields,
      lookUp,
      unwindSessions,
      addFields1,
      lookUp1,
      unwindGrades,

      group,
      project,
      limit,
    ];

    let students = await db.aggregateData(User, query);
    res.json({
      status: true,
      result: students,
    });

    // let students = await User.find({role_id:"776425a6489a5dea266da9e928b9fe08"}); // static for now will change
    //  res.json({ status: true, result: students });
  }

  async getParents(req, res) {
    let { user_id } = req.headers;
    let lookUp = {};
    let unwindSessions = {};

    let lookUp1 = {};
    let unwindRelations = {};

    let lookUp2 = {};
    let unwindStudent = {};

    let match = {};
    let confirm = req.params.is_confirm == 'true' ? '1' : '0';

    let role = await RoleModel.findOne({
      weight: 6,
      'created_by.user_id': user_id,
    });

    if (!role) {
      res.json({
        status: false,
        result: [],
        message: 'Please add user with role 6 i.e parent',
      });
      return;
    }

    match = {
      $match: {
        //role_id: "776425a6489a5dea266da9e928b9fe08", // static for now will change
        role_id: ObjectId(role._id).toString(), // static for now will change
        'created_by.user_id': user_id,
      },
    };

    let addFields = {
      $addFields: {
        sessionObjectId: {
          $toObjectId: '$session_id',
        },
      },
    };
    lookUp = {
      $lookup: {
        from: 'sessionmodels',
        localField: 'sessionObjectId',
        foreignField: '_id',
        as: 'sessionData',
      },
    };

    unwindSessions = {
      $unwind: {
        path: '$sessionData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let addFields1 = {
      $addFields: {
        relationObjectId: {
          $toObjectId: '$relation_id',
        },
      },
    };

    lookUp1 = {
      $lookup: {
        from: 'relationmodels',
        localField: 'relationObjectId',
        foreignField: '_id',
        as: 'relationData',
      },
    };

    unwindRelations = {
      $unwind: {
        path: '$relationData',
        preserveNullAndEmptyArrays: true,
      },
    };

    lookUp2 = {
      $lookup: {
        from: 'users',
        localField: 'student_id',
        foreignField: 'user_id',
        as: 'studentData',
      },
    };

    unwindStudent = {
      $unwind: {
        path: '$studentData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let project = {
      $project: {
        _id: 1,
        contact_info: 1,
        personal_info: 1,
        physical_info: 1,
        image: 1,
        inquiry_status_id: 1,
        source_id: 1,
        source_details: 1,
        user_id: 1,
        student: 1,

        email: 1,
        logo_image: 1,
        active: 1,

        created_at: 1,
        created_by: 1,

        school_id: 1,
        'session._id': 1,
        'session.id': 1,
        'session.name': 1,
        relation: 1,
        credentials: {
          $cond: {
            if: {
              $eq: ['$password', ''],
            },
            then: 'No',
            else: 'Yes',
          },
        },

        // "grade.name": 1,
        // "grade._id": 1,
        // "grade.id": 1,
      },
    };

    let group = {
      $group: {
        _id: '$_id',
        image: {
          $first: '$image',
        },
        contact_info: {
          $first: '$contact_info',
        },
        active: {
          $first: '$active',
        },
        personal_info: {
          $first: '$personal_info',
        },
        physical_info: {
          $first: '$physical_info',
        },
        logo_image: {
          $first: '$logo_image',
        },
        user_id: {
          $first: '$user_id',
        },
        student: {
          $first: '$studentData',
        },
        school_id: {
          $first: '$school_id',
        },
        studentData: {
          $first: '$studentData',
        },
        relation: {
          $first: '$relationData',
        },
        //  student:{$first:"$student"},
        // inquiry_date:{$first:"$inquiry_date"},
        // inquiry_status_id:{$first:"$inquiry_status_id"},
        // source:{$first:"$source"},
        // source_details:{$first:"$source_details"},
        first_name: {
          $first: '$first_name',
        },
        last_name: {
          $first: '$last_name',
        },
        middle_name: {
          $first: '$middle_name',
        },
        // endTime: {$first:"$endTime"},
        gender_id: {
          $first: '$gender_id',
        },
        medical: {
          $first: '$medical',
        },
        address: {
          $first: '$address',
        },
        birth_date: {
          $first: '$birth_date',
        },
        email: {
          $first: '$email',
        },
        phone: {
          $first: '$phone',
        },

        created_at: {
          $first: '$created_at',
        },
        created_by: {
          $first: '$created_by',
        },
        active: {
          $first: '$active',
        },
        // is_confirm: {$first:"$is_confirm"},
        session: {
          $first: '$sessionData',
        },
        credentials: {
          $first: 'credentials',
        },
        //   grade: {$first: "$gradesData"},
      },
    };
    let query = [
      match,
      addFields,
      lookUp,
      unwindSessions,
      addFields1,
      lookUp1,
      unwindRelations,
      lookUp2,
      unwindStudent,

      group,
      project,
    ];

    let students = await db.aggregateData(User, query);
    res.json({
      status: true,
      result: students,
    });

    // let students = await User.find({role_id:"776425a6489a5dea266da9e928b9fe08"}); // static for now will change
    //  res.json({ status: true, result: students });
  }

  async getStudentParents(req, res) {
    let { user_id } = req.headers;
    let { id, pickup } = req.params;
    let lookUp = {};
    let unwindSessions = {};

    let lookUp1 = {};
    let unwindRelations = {};

    let lookUp2 = {};
    let unwindStudent = {};

    let match = {};
    let confirm = req.params.is_confirm == 'true' ? '1' : '0';

    let role = await RoleModel.findOne({
      weight: 6,
      'created_by.user_id': user_id,
    });

    if (!role) {
      res.json({
        status: false,
        result: [],
        message: 'Please add user with role 6 i.e parent',
      });
      return;
    }

    match = {
      $match: {
        //role_id: "776425a6489a5dea266da9e928b9fe08", // static for now will change
        role_id: ObjectId(role._id).toString(), // static for now will change
        student_id: id,
        pickup,
        'created_by.user_id': user_id,
      },
    };

    let addFields = {
      $addFields: {
        sessionObjectId: {
          $toObjectId: '$session_id',
        },
      },
    };
    lookUp = {
      $lookup: {
        from: 'sessionmodels',
        localField: 'sessionObjectId',
        foreignField: '_id',
        as: 'sessionData',
      },
    };

    unwindSessions = {
      $unwind: {
        path: '$sessionData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let addFields1 = {
      $addFields: {
        relationObjectId: {
          $toObjectId: '$relation_id',
        },
      },
    };

    lookUp1 = {
      $lookup: {
        from: 'relationmodels',
        localField: 'relationObjectId',
        foreignField: '_id',
        as: 'relationData',
      },
    };

    unwindRelations = {
      $unwind: {
        path: '$relationData',
        preserveNullAndEmptyArrays: true,
      },
    };

    lookUp2 = {
      $lookup: {
        from: 'users',
        localField: 'student_id',
        foreignField: 'user_id',
        as: 'studentData',
      },
    };

    unwindStudent = {
      $unwind: {
        path: '$studentData',
        preserveNullAndEmptyArrays: true,
      },
    };

    let project = {
      $project: {
        _id: 1,
        contact_info: 1,
        personal_info: 1,
        physical_info: 1,
        image: 1,
        inquiry_status_id: 1,
        source_id: 1,
        source_details: 1,
        user_id: 1,
        student: 1,

        email: 1,
        logo_image: 1,
        active: 1,

        created_at: 1,
        created_by: 1,

        school_id: 1,
        'session._id': 1,
        'session.id': 1,
        'session.name': 1,
        relation: 1,
        credentials: {
          $cond: {
            if: {
              $eq: ['$password', ''],
            },
            then: 'No',
            else: 'Yes',
          },
        },

        // "grade.name": 1,
        // "grade._id": 1,
        // "grade.id": 1,
      },
    };

    let group = {
      $group: {
        _id: '$_id',
        image: {
          $first: '$image',
        },
        contact_info: {
          $first: '$contact_info',
        },
        active: {
          $first: '$active',
        },
        personal_info: {
          $first: '$personal_info',
        },
        physical_info: {
          $first: '$physical_info',
        },
        logo_image: {
          $first: '$logo_image',
        },
        user_id: {
          $first: '$user_id',
        },
        student: {
          $first: '$studentData',
        },
        school_id: {
          $first: '$school_id',
        },
        studentData: {
          $first: '$studentData',
        },
        relation: {
          $first: '$relationData.name',
        },
        //  student:{$first:"$student"},
        // inquiry_date:{$first:"$inquiry_date"},
        // inquiry_status_id:{$first:"$inquiry_status_id"},
        // source:{$first:"$source"},
        // source_details:{$first:"$source_details"},
        first_name: {
          $first: '$first_name',
        },
        last_name: {
          $first: '$last_name',
        },
        middle_name: {
          $first: '$middle_name',
        },
        // endTime: {$first:"$endTime"},
        gender_id: {
          $first: '$gender_id',
        },
        medical: {
          $first: '$medical',
        },
        address: {
          $first: '$address',
        },
        birth_date: {
          $first: '$birth_date',
        },
        email: {
          $first: '$email',
        },
        phone: {
          $first: '$phone',
        },

        created_at: {
          $first: '$created_at',
        },
        created_by: {
          $first: '$created_by',
        },
        active: {
          $first: '$active',
        },
        // is_confirm: {$first:"$is_confirm"},
        session: {
          $first: '$sessionData',
        },
        credentials: {
          $first: 'credentials',
        },
        //   grade: {$first: "$gradesData"},
      },
    };
    let query = [
      match,
      addFields,
      lookUp,
      unwindSessions,
      addFields1,
      lookUp1,
      unwindRelations,
      lookUp2,
      unwindStudent,

      group,
      project,
    ];

    let parents = await db.aggregateData(User, query);
    res.json({
      status: true,
      result: parents,
    });
  }

  async addParent(req, res) {
    try {
      let userData = req.body;
      let { user_id, user_name } = req.headers;
      let email = userData.email;
      let existing = await User.findOne({
        email: email,
      });
      let roleParent = await RoleModel.findOne({
        weight: 6,
        'created_by.user_id': user_id,
      });
      if (!roleParent) {
        res.json({
          status: false,
          result: [],
          message: 'Please add user with role 6 i.e parent',
        });
        return;
      }
      if (existing) {
        res.json({
          status: false,
          message: 'This user is already existing. Please try with another email address.',
        });
      } else {
        await User.create({
          user_id: shortid.generate(),
          email: userData.email,
          //password: "123456",
          //role_id: "ebaf8470e2a1a22b84fe38ec55143c32", // for parent
          role_id: roleParent._id, // for parent
          personal_info: userData.personal_info,
          contact_info: userData.contact_info,
          session_id: userData.session_id,
          // physical_info: userData.physical_info,
          //    social_media_links: userData.social_media_links,
          //  emergency_contact: userData.emergency_contact,
          relation_id: userData.relation_id,
          pickup: userData.pickup,
          student_id: userData.student_id,
          created_at: Date.now(),
          created_by: {
            name: user_name,
            user_id: user_id,
          },
        });
        saveActivity(user_id, user_name, 'Parent', 'A Parent has been created', 'created');
        res.json({
          status: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async editParent(req, res) {
    try {
      let userData = req.body;
      let { user_id, user_name } = req.headers;
      let { parent_id } = req.params;
      await User.updateOne(
        {
          user_id: parent_id,
        },
        {
          ...userData,
          updated_at: Date.now(),
          updated_by: {
            user_id: user_id,
            user_name: user_name,
          },
        }
      );
      saveActivity(user_id, user_name, 'Parent', 'A parent was updated.', 'Updated');
      res.json({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async changeStatus(req, res) {
    let { id } = req.body;
    let { user_id, user_name } = req.headers;
    let user = await User.findOne({
      user_id: id,
    });
    user.active = !user.active;
    await user.save();
    saveActivity(user_id, user_name, 'User', 'User status has been updated', 'updated');
    res.json({
      status: true,
    });
  }

  async generateStudentPassword(req, res) {
    let { id } = req.body;
    let { user_id, user_name } = req.headers;
    let user = await User.findOne({
      user_id: id,
    });
    let pass = 'Student_' + shortid.generate();
    user.password = pass;
    user.active = true;
    await user.save();
    saveActivity(user_id, user_name, 'User', 'Student password has been updated', 'updated');
    res.json({
      status: true,
      password: pass,
    });
  }

  async generateParentPassword(req, res) {
    let { id } = req.body;
    let { user_id, user_name } = req.headers;
    let user = await User.findOne({
      user_id: id,
    });
    let pass = 'Parent_' + shortid.generate();
    user.password = pass;
    user.active = true;
    await user.save();
    saveActivity(user_id, user_name, 'User', 'Parent password has been generated', 'updated');
    res.json({
      status: true,
      password: pass,
    });
  }

  async deleteAdmin(req, res) {
    let { id } = req.params;
    let { user_id, user_name } = req.headers;
    await User.deleteOne({
      user_id: id,
    });
    saveActivity(user_id, user_name, 'User', 'A user has been deleted', 'deleted');
    res.json({
      status: true,
    });
  }

  async getAdmin(req, res) {
    let { id } = req.params;
    let user = await User.findOne({
      user_id: id,
    });
    res.json({
      status: true,
      result: user,
    });
  }
  async updatePhysicalInfo(req, res) {
    try {
      let { userData, id } = req.body;
      let { user_id, user_name } = req.headers;
      await User.updateOne(
        {
          user_id: id,
        },
        {
          $set: {
            // email: userData.email,
            //  password: userData.password,
            //  role_id: userData.role_id,
            // personal_info: userData.personal_info,
            // contact_info: userData.contact_info,
            physical_info: userData.physical_info,
            //  social_media_links: userData.social_media_links,
            // emergency_contact: userData.emergency_contact,
            updated_at: Date.now(),
            updated_by: {
              name: user_name,
              user_id: user_id,
            },
          },
        }
      );
      saveActivity(user_id, user_name, 'User', 'A user has been updated', 'updated');
      res.json({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  // async updateAdmin(req, res) {
  //     try {
  //         let { userData, id } = req.body;
  //         let { user_id, user_name } = req.headers;
  //         await User.updateOne({ user_id: id }, {

  //             $set:{

  //             email: userData.email,
  //           //  password: userData.password,
  //             role_id: userData.role_id,
  //             personal_info: userData.personal_info,
  //             contact_info: userData.contact_info,
  //             physical_info: userData.physical_info,
  //             logo_image: userData.logo_image,
  //             social_media_links: userData.social_media_links,
  //             emergency_contact: userData.emergency_contact,
  //             updated_at: Date.now(),
  //             updated_by: {
  //                 name: user_name,
  //                 user_id: user_id
  //             }
  //         }
  //              });
  //         saveActivity(user_id, user_name, "User", "A user has been updated", "updated");
  //         res.json({ status: true });
  //     } catch (error) {
  //         console.log(error)
  //         res.json({ status: false, message: 'Server Error.' });
  //     }

  // }

  async addUpdateStudentSkills(req, res) {
    try {
      let { skills, id } = req.body;
      let { user_id, user_name } = req.headers;
      await User.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            skills: skills,
            updated_at: Date.now(),
            updated_by: {
              name: user_name,
              user_id: user_id,
            },
          },
        }
      );

      saveActivity(user_id, user_name, 'Skill', 'USer Skills has been updated', 'updated');
      res.json({
        status: true,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: false,
        message: 'Server Error.',
      });
    }
  }

  async getUserById(req, res) {
    let { user_id } = req.params;
    let user = await User.findOne({
      user_id: user_id,
    });
    res.json({
      status: true,
      result: user,
    });
  }

  // Send SMS
  async sendSMS(req, res) {
    let { userId, message } = req.body;
    
    const user = await User.findOne({
      _id: userId,
    });

    const sms = {
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.contact_info.phone,
    };
    await sendSMS(sms);

    res.json({
      status: true,
    });
  }
}

module.exports = userController;
