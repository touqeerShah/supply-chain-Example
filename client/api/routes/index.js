var express = require('express');
var router = express.Router();
var glob = require("glob")
var api_functions = require('../controllers/API_functions.js')
const bodyParser = require('body-parser');

const moment = require('moment');
const app = express()
  .use(bodyParser.json());

var return_args = {}


router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH ,DELETE ,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization,origin,Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});






router
  .route('/CreateBaggage')
  .post(function (req, res) {

    console.log(req.body);
    if (req.body.baggageId == undefined ||
      req.body.source == undefined ||
      req.body.destination == undefined || req.body.path == undefined) {
      return_args.message = `Important Argument is missing`
      res.send(return_args)

    } else {

      next_function = function (return_args) {
        res.send(return_args)
      }





      try {
        JSON.parse(req.body.path)
      } catch (err) {
        return_args.status = `400`

        return_args.warning = `unable to parsr into json`
        res.send(return_args)
      }
      api_functions.invoke("interliner", 'interlinerchannel', 'SmartContracts', "connection-org3.json", 'CreateBaggage', next_function, req.body.baggageId, req.body.source, req.body.destination, req.body.path);

    }
  });





router
  .route('/RegisterAirports')
  .post(function (req, res) {
    console.log("hereee");
    if (req.body.airportId == undefined || req.body.location == undefined) {
      return_args.warning = `Important Argument is missing`
      res.send(return_args)

    } else {

      next_function = function (return_args) {
        console.log(return_args);
        if (return_args.status == 200) {
          next_function = function (return_args) {
            res.send(return_args)
          }

          api_functions.invoke(req.body.airportId, 'interlinerchannel', 'SmartContracts', "connection-org2.json", 'RegisterAirports', next_function, req.body.airportId, req.body.location);
        } else {
          res.send(return_args)
        }
      }
      api_functions.register("adminAirport", "Airport", req.body.airportId, "ca.airport.example.com", "connection-org2.json", 'airport.department1', "AirportMSP", next_function)
    }
  });


router
  .route('/RegisterAirlines')
  .post(function (req, res) {
    console.log("hereee");
    if (req.body.airlineId == undefined) {
      return_args.warning = `Important Argument is missing`
      res.send(return_args)

    } else {

      next_function = function (return_args) {
        console.log(return_args);
        if (return_args.status == 200) {
          next_function = function (return_args) {
            res.send(return_args)
          }

          api_functions.invoke(req.body.airlineId, 'interlinerchannel', 'SmartContracts', "connection-org1.json", 'RegisterAirlines', next_function, req.body.airlineId);
        } else {
          res.send(return_args)
        }
      }
      api_functions.register("adminAirline", "Airline", req.body.airlineId, "ca.airline.example.com", "connection-org1.json", 'airline.department1', "AirlineMSP", next_function)
    }
  });


router
  .route('/ChangeBaggageStatusByAirport')
  .post(function (req, res) {
    console.log("hereee");
    if (req.body.baggageId == undefined||req.body.status == undefined || req.body.fees == undefined) {
      return_args.warning = `Important Argument is missing`
      res.send(return_args)

    } else {
      next_function = function (return_args) {
        res.send(return_args)
      }
      api_functions.invoke(req.body.airportId, 'interlinerchannel', 'SmartContracts', "connection-org2.json", 'ChangeBaggageStatusByAirport', next_function, req.body.baggageId,req.body.status , req.body.fees);
    }
  });

  router
  .route('/ChangeBaggageStatusByAirlines')
  .post(function (req, res) {
    console.log("hereee");
    if (req.body.baggageId == undefined||req.body.status == undefined || req.body.fees == undefined) {
      return_args.warning = `Important Argument is missing`
      res.send(return_args)

    } else {
      next_function = function (return_args) {
        res.send(return_args)
      }
      api_functions.invoke(req.body.airlineId, 'interlinerchannel', 'SmartContracts', "connection-org1.json", 'ChangeBaggageStatusByAirlines', next_function, req.body.baggageId,req.body.status , req.body.fees);
    }
  });


router
.route('/GetBaggageDetails')
.get(function (req, res) {

  next_function = function (return_args) {
    res.send(return_args)
  }
  api_functions.query("interliner", 'interlinerchannel', 'SmartContracts', "connection-org3.json", 'GetBaggageDetails', next_function, req.body.baggageId);

});


module.exports = router;



