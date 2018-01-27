 // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA-rUnE0olcUGKRAYKJDxYCg6VDSXJxc8s",
    authDomain: "train-scheduler-328f5.firebaseapp.com",
    databaseURL: "https://train-scheduler-328f5.firebaseio.com",
    projectId: "train-scheduler-328f5",
    storageBucket: "train-scheduler-328f5.appspot.com",
    messagingSenderId: "688751463350"
  };
firebase.initializeApp(config);
var database = firebase.database();

var data;

database.ref().on("value", function(snapshot) {
  
  data = snapshot.val();

  refreshTable();

});

$("#addTrainButton").on('click', function(){

  var trainName = $("#nameInput").val().trim();
  var trainDestination = $("#destinationInput").val().trim();
  var trainFirstArrivalTime = $("#firstArrivalInput").val().trim();
  var trainFreq = $("#frequencyInput").val().trim();

  if(trainName == "" || trainName == null){
    alert("Enter Train Name!");
    return false;
  }
  if(trainDestination == "" || trainDestination == null){
    alert("Enter Train Destination!");
    return false;
  }
  if(trainFirstArrivalTime == "" || trainFirstArrivalTime == null){
    alert("Enter Earliest Arrival Time!");
    return false;
  }
  if(trainFreq == "" || trainFreq == null || trainFreq < 1){
    alert("Enter arrival frequency (in minutes)!" + "\n" + "Must be integer greater than zero.");
    return false;
  }

  if(trainFirstArrivalTime.length != 5 || trainFirstArrivalTime.substring(2,3) != ":"){
    alert("Only use Military Time! \n" + "Example: 01:30 or 17:00");
    return false;
  }

  else if( isNaN(parseInt(trainFirstArrivalTime.substring(0, 2))) || isNaN(parseInt(trainFirstArrivalTime.substring(3))) ){
    alert("Only use Military Time! \n" + "Example: 01:30 or 17:00");
    return false;
  }

  else if( parseInt(trainFirstArrivalTime.substring(0, 2)) < 0 || parseInt(trainFirstArrivalTime.substring(0, 2)) > 23 ){
    alert("Only use Military Time! \n" + "Example: 01:30 or 17:00");
    return false;
  }

  else if( parseInt(trainFirstArrivalTime.substring(3)) < 0 || parseInt(trainFirstArrivalTime.substring(3)) > 59 ){
    alert("Only use Military Time! \n" + "Example: 01:30 or 17:00");
    return false;   
  }

  var today = new Date();
  var thisMonth = today.getMonth() + 1;
  var thisDate = today.getDate();
  var thisYear = today.getFullYear();
 
  var dateString = "";
  var dateString = dateString.concat(thisMonth, "/", thisDate, "/", thisYear);

  var trainFirstArrival = dateString.concat(" ", trainFirstArrivalTime);


  // Push Data to FireBase
  database.ref().push({
    name: trainName,
    destination: trainDestination,
    firstArrival: trainFirstArrival,
    frequency: trainFreq
  });

  // Input Clear Following Submission
  $("#nameInput").val("");
  $("#destinationInput").val("");
  $("#firstArrivalInput").val("");
  $("#frequencyInput").val("");

  // Prevent Default Refresh of Submit Button
  return false;
});

function refreshTable(){

  $('.table-body-row').empty();

  var arrayOfObjects = [];

  var arrayOfTimes = [];

  $.each(data, function(key, value){

    var trainName = value.name;
    var trainDestination = value.destination;
    var trainFreq = value.frequency;

    var trainFirstArrivalTime = value.firstArrival;
    
    var trainNextDeparture;
    var trainMinutesAway;

    var convertedDate = moment(new Date(trainFirstArrivalTime));
    
    // Determine Minutes Away for Train

    var minuteDiffFirstArrivalToNow = moment(convertedDate).diff( moment(), "minutes")*(-1);
      if(minuteDiffFirstArrivalToNow <= 0){
        trainMinutesAway = moment(convertedDate).diff( moment(), "minutes");
        trainNextDepartureDate = convertedDate;
      }

      else{
        trainMinutesAway = trainFreq - (minuteDiffFirstArrivalToNow % trainFreq);
        var trainNextDepartureDate = moment().add(trainMinutesAway, 'minutes');
      }

    trainNextDeparture = trainNextDepartureDate.format("hh:mm A");

    var newObject = {
      name: trainName,
      destination: trainDestination,
      freq: trainFreq,
      nextDeparture: trainNextDeparture,
      minAway: trainMinutesAway
    };

    arrayOfObjects.push(newObject);
    arrayOfTimes.push(trainMinutesAway);
  });

  arrayOfTimes.sort(function(a, b){return a-b});

  $.unique(arrayOfTimes)
    
  // Loops for time values
  for(var i = 0; i < arrayOfTimes.length; i++){

    for(var j = 0; j < arrayOfObjects.length; j++){

      if(arrayOfObjects[j].minAway == arrayOfTimes[i]){

        var newRow = $('<tr>');
        newRow.addClass("table-body-row");

        var trainNameTd = $('<td>');
        var destinationTd = $('<td>');
        var frequencyTd = $('<td>');
        var nextDepartureTd = $('<td>');
        var minutesAwayTd = $('<td>');

        trainNameTd.text(arrayOfObjects[j].name);
        destinationTd.text(arrayOfObjects[j].destination);
        frequencyTd.text(arrayOfObjects[j].freq);
        nextDepartureTd.text(arrayOfObjects[j].nextDeparture);
        minutesAwayTd.text(arrayOfObjects[j].minAway);

        newRow.append(trainNameTd);
        newRow.append(destinationTd);
        newRow.append(frequencyTd);
        newRow.append(nextDepartureTd);
        newRow.append(minutesAwayTd);

        $('.table').append(newRow);

      }
    }
  }
}

// Update Time every second
var timeStep = setInterval(currentTime, 1000);

function currentTime(){
  var timeNow = moment().format("hh:mm:ss A");
  $("#current-time").text(timeNow);

  // Refresh the Page every minute
  var secondsNow = moment().format("ss");

  if(secondsNow == "00"){
    refreshTable();
  }

}