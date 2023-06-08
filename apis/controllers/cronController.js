const { base64decode } = require("nodejs-base64");
let Common = require("../common/commonfunction");
var cron = require('cron');
const request = require('request');

const common_cron = async (next) => {
        //cron for import client user at intercom 
        // ex:- sec  min  hr day-of-month month day-of-week
        // ex:- 

        //To update all resources logout
        new cron.CronJob('0 58 23 * * *', async (req, res) => {//11:58PM
            try {
              let base_url = "http://15.206.252.59:8080/api/";
              console.log(new Date().toLocaleString());
              if(process.env.PORT == 8080 && process.env.NODE_ENV == "development"){
                base_url = "http://15.206.252.59:8080/api/";
              }
              else if(process.env.PORT == 3000 && process.env.NODE_ENV == "production"){
                base_url = "http://15.206.252.59:3000/api/";
              }

               request.get(base_url + 'logout-all-resources', (err, response, body) => {
              
              });
            } catch (e) {
              console.log('Something went wrong', e.message, e.stack);
            }
          }, null, true, 'Asia/Calcutta');


     //To carried forward all data to the next month in finance module at the end of the month ...

     const currentMonthDate = new Date();
     const currentYear = parseInt(currentMonthDate.getFullYear());
     const currentMonth = parseInt(currentMonthDate.getMonth());
     var lastday = function(y,m){  return  parseInt(new Date(y, m +1, 0).getDate()); }
     let finalLastDay = lastday(currentYear,currentMonth);
    
    new cron.CronJob(`59 23 ${finalLastDay} * *`, async (req, res) => { //Last Day of every month at 11:59 PM
      try {
        // let base_url = "http://localhost:8080/api/";
        let base_url = "http://15.206.252.59:8080/api/";
        if(process.env.PORT == 8080 && process.env.NODE_ENV == "development"){
          base_url = "http://15.206.252.59:8080/api/";
        }
        else if(process.env.PORT == 3000 && process.env.NODE_ENV == "production"){
          base_url = "http://15.206.252.59:3000/api/";
        }

        let monthArray =
        [
            { num: 1, month: 4, name: 'April', year: currentYear },
            { num: 2, month: 5, name: 'May', year: currentYear },
            { num: 3, month: 6, name: 'June', year: currentYear },
            { num: 4, month: 7, name: 'July', year: currentYear },
            { num: 5, month: 8, name: 'August', year: currentYear },
            { num: 6, month: 9, name: 'September', year: currentYear },
            { num: 7, month: 10, name: 'October', year: currentYear },
            { num: 8, month: 11, name: 'November', year: currentYear },
            { num: 9, month: 12, name: 'December', year: currentYear },
            { num: 10, month: 1, name: 'January', year: currentYear + 1 },
            { num: 11, month: 2, name: 'Febraury', year: currentYear + 1 },
            { num: 12, month: 3, name: 'March', year: currentYear + 1 },
        ];
        console.log("Finance module cron executed successfully");
        let findMonth = monthArray.find(item => item.month === parseInt(currentMonth + 1));
        let url = `${base_url}forward-data-to-next-month-for-cron?month=${findMonth.num}&year=${currentYear}`
         request.get(url, (err, response, body) => {    });
        
      } catch (e) {
        console.log('Something went wrong', e.message, e.stack);
      }
    }, null, true, 'Asia/Calcutta');

}
module.exports = {
    common_cron
}