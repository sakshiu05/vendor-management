// 'use strict';
var hackerEarthFunction = require("../middlewares/hackerEarth").commonHackerEarthPost;

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To create Invite links ..
      * Function : createInvitationLink
      * Api: create-invitation-link
      */

      const createInvitationLink = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/invite/";
          var sendParams = {
            'test_id': 1955055,
            'emails': ['sakshi.u@supersourcing.com'],//'shubhankar.k@engineerbabu.in',
            'send_email': true,
            'auto_expiry_days': 7,
            // 'extra_parameters': {
            //   'candidate_names': {
            //     'foo@bar.com': 'Foo Bar',
            //     'alice@bob.com': 'Alice Bob'
            //   },
            // 'redirect_urls': {
            //   'foo@bar.com': 'http://www.redirecturl.com/',
            //   'alice@bob.com': 'http://www.redirecturl2.com/'
            // },
            // 'report_callback_urls': {
            //   'foo@bar.com': 'http://www.callbackurl.com/',
            //   'alice@bob.com': 'http://www.callbackurl2.com/'
            // }
            //}
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To delete particular test ..
      * Function : deleteParticularTest
      * Api: delete-particular-test
      */

      const deleteParticularTest = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events/delete/";
          var sendParams = {
            'test_id': 53
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To publish particular test..
      * Function : publishTest
      * Api: publish-test
      */

      const publishTest = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events/publish/";
          var sendParams = {
            'test_id': 1955055
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To get particular test report..
      * Function : getTestReport
      * Api: get-test-report
      */

      const getTestReport = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events/report/";
          var sendParams = {
            'test_id': 53
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To reset Test for given emails..
      * Function : resetTest
      * Api: reset-test
      */

      const resetTest = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events/reset/";
          var sendParams = {
            'test_id': 55,
            'emails': [EMAIL,],
            'reset_for_all': False,  // If the reset_for_all is true, test will get reset for all the candidates. If it is false, test will get reset for whatever emails provided in the emails parameter.
            'send_email': True
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To extend Time For Particular Test..
      * Function : extendTimeForParticularTest
      * Api: extend-time-for-particular-test
      */

      const extendTimeForParticularTest = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events/extend-time/";
          var sendParams = {
            'test_id': 55,
            'emails': ["hacker@hackerearth.com", "hacker2@hackerearth.com"],
            'send_email': True, // If this field is not provided, by default send_email will be false and candidates will not receive event extend emails. If this value is True candidates will receive event extend emails.
            'extend_for_all': False, // If this value is true, test is extended for all the candidates. If this value is false, test is extended for the emails which are provided in the emails parameter
            'extension_time': 20, // Test gets extended for the candidates by specified number of minutes
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }


      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To cancel Invites for given gimals ...
      * Function : cancelInvites
      * Api: cancel-invites
      */

      const cancelInvites = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/cancel-invite/";
          var sendParams = {
            'test_id': 33,
            'emails': ['foo@bar.com', 'alice@bob.com', 'yet@another.email']
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To get Bulk Candidate Reports ...
      * Function : getAllBulkCandidateReports
      * Api: get-bulk-candidate-reports
      */

      const getAllBulkCandidateReports = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events/candidates/bulk-reports/";
          var FILTERS = {
            "start_datetime":
            {
              "min": "2018-08-01T21:25:02+05:30",
              "max": "2019-08-21T23:25:02+05:30"
            },
            "finish_datetime":
            {
              "min": "2018-08-01T22:25:02+05:30",
              "max": "2019-08-21T23:25:02+05:30"
            }
          };

          var sendParams = {
            'test_id': 33,
            // 'emails': ['foo@bar.com', 'alice@bob.com', 'yet@another.email'], if this given array than only particular that email data is given ..!
            //  'filters': FILTERS,
            'page_number': req.query.page ? req.query.page : 1,
            'page_size': req.query.limit ? req.query.limit : 10
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }


      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To get Event List with filters...
      * Function : getEventList
      * Api: get-event-list
      */

      const getEventList = async (req, res) => {

        try {
          let upcoming_data = req.body;
          var url = "https://api.hackerearth.com/partner/hackerearth/events-list/";
          var FILTERS = {
            "ids": [1953389, 1955055]
            // "start_datetime":
            // {
            //   "min": "2018-08-01T21:25:02+05:30",
            //   "max": "2019-08-21T23:25:02+05:30"
            // },
            // "end_datetime":
            // {
            //   "min": "2018-08-01T22:25:02+05:30",
            //   "max": "2019-08-21T23:25:02+05:30"
            // },
            // "creation_datetime":
            // {
            //   "min": "2018-08-01T20:25:02+05:30",
            //   "max": "2019-08-21T10:25:02+05:30"
            // }
          }
          var sendParams = {
            'filters': FILTERS,
            'page_number': req.query.page ? req.query.page : 1,
            'page_size': req.query.limit ? req.query.limit : 10
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {console.log(error.stack);
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }

      /*
      * Created By: Shubhankar Kesharwani
      * Created At: 07-06-2022
      * Updated By: NA
      * Updated Date: NA
      * Desc: To get patticular Candidates Report...
      * Function : getCandidatesReport
      * Api: get-candidates-report
      */

      const getCandidatesReport = async (req, res) => {

        try {

          var url = "https://api.hackerearth.com/partner/hackerearth/events/candidates/report/";
          var sendParams = {
            'test_id': 1953389,
            'email': 'sakshi.u@supersourcing.com'
          };

          let data = await hackerEarthFunction(url, sendParams);

          return res.status(200).send({ data, message: "Data Founded successfully", status: true });

        }
        catch (error) {
          return res.status(400).send({ message: "Something went wrong in function ..!", status: false, error: error.message });
        }
      }


      module.exports = {
        createInvitationLink,
        deleteParticularTest,
        publishTest,
        getTestReport,
        resetTest,
        extendTimeForParticularTest,
        cancelInvites,
        getAllBulkCandidateReports,
        getEventList,
        getCandidatesReport
      }