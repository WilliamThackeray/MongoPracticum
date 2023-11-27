// import axios from 'axios'
// console.log(axios)

window.addEventListener('load', (event) => {
  console.log('page loaded');

  // console.log('get pref result: ', getPref())
  let pref = getPref()

  setup(pref);
});

// this function sets up the default page when it has loaded.
const URL =
  'http://localhost:3000/';
const API_ROUTE = 'api/v1/';

async function setup( pref ) {
  console.log('setup')

  // set to dark mode
  if (pref === 'dark') $('body').addClass('dark')

  let submitBtn = $('#submitBtn');
  submitBtn.addEvent('click', async function () {
    event.preventDefault();
    addLog();
  });

  let courseDropdown = $('#course');
  let idInput = $('#uvuIdDiv');


  courseDropdown.addEvent('change', () => {
    courseDropdown.val()
      ? idInput.removeClass('hidden')
      : idInput.addClass('hidden');
  });

  // initialize the dropdown
  let allCourses = await getCourses();
  console.log('allCourses: ', allCourses)
  for (let c of allCourses) {
    let opt = document.createElement('option');
    opt.value = c.id;
    opt.text = c.display;
    courseDropdown.append(opt);
  }


  // id input validation
  let uvuId = $('#uvuId')
  uvuId.addEvent('keyup', () => {
    // test for non digits
    let errsDiv = $('#errorsDiv');
    let errMsg = document.createElement('p');
    errMsg.id = 'nonDigitErr';
    let reg = /^[0-9]*$/;
    if (reg.test(uvuId.val())) {
      // no errors
      if (uvuId.hasClass('border-red')) {
        uvuId.removeClass('border-red');
      }
    } else {
      // errors
      uvuId.addClass('border-red');
    }
  });

  // below is the code to fetch the logs
  uvuId.addEvent('keyup', async function () {
    let idInput = $('#uvuId');
    if (idInput.val().length === 8 && !idInput.hasClass('border-red')) {
      // fetch the logs and populate the list.
      let logs = await getLogs(idInput.val());
      let logTitle = $('#uvuIdDisplay');
      if (logs.length === 0) {
        // there are no logs, let the user know
        let stuLogs = $('#logs'); // get the current set of logs
        logTitle.html(`Student Logs for ${idInput.val()}`);
        clearLogs();
        stuLogs.html(`<div>There are no logs by this id. Please write your first log, or double check it is the correct id.</div>`);
      } else {
        // if there are logs, populate the logs
        logTitle.html(`Student Logs for ${idInput.val()}`)
        await populateLogs(logs);
      }
    }
  });

  let txtarea = document.getElementById('txtArea');
  let logBtn = document.getElementById('submitBtn');
  let inputId = document.getElementById('uvuId');
  txtarea.addEventListener('keyup', () => {
    if (
      txtarea.value == '' ||
      inputId.value.length !== 8 ||
      inputId.classList.contains('error')
    ) {
      logBtn.disabled = true;
      logBtn.classList.remove('cursor-pointer')
      logBtn.classList.add('cursor-not-allowed')
    } else {
      logBtn.disabled = false;
      logBtn.classList.add('cursor-pointer')
      logBtn.classList.remove('cursor-not-allowed')
    }
  });

  liEvents();

  // checkbox events
  let lCheck = $('#lightCheck')
  let dCheck = $('#darkCheck')
  lCheck.addEvent('click', function () {
    addPref('light')
    // check if pref is loaded, load if it is not
    if ($('body').hasClass('dark')) $('body').removeClass('dark')
  })
  dCheck.addEvent('click', function () {
    addPref('dark')
    // check if pref is loaded, load if it is not
    if (!$('body').hasClass('dark')) $('body').addClass('dark')
  })
}

// GET the course values from the url.
async function getCourses() {
  console.log('getCourses()')
  try {
    console.log('try to get courses'); // try to get courses
    const courses = await axios.get(`${URL}${API_ROUTE}courses`).then();
    console.log('successful course grab'); // it was successful
    return courses.data;
  } catch (error) {
    console.error(error);
  }
}

// GET the logs for attatched to the student id.
async function getLogs(id) {
  let dropdownVal = $('#course').val();
  let stuId = $('#uvuId').val();
  try {
    console.log('try to get logs'); // try to get logs
    const logs = await axios.get(
      `${URL}${API_ROUTE}logs?courseId=${dropdownVal}&uvuId=${stuId}`
    );
    console.log('successful log grab'); // it was successful
    console.log(logs.data);
    let stuLogs = []
    for (let log of logs.data) {
      if ((log.courseId == dropdownVal) && (log.uvuId == stuId)) {
        stuLogs.push(log)
      }
    }
    return stuLogs;
  } catch (error) {
    console.error(error);
  }
}

async function clearLogs() {
  let stuLogs = $('#logs'); // get the current set of logs
  stuLogs.html(''); // clear the current logs
}

// Populate the logs in the student logs section
async function populateLogs(logs) {
  console.log('populateLogs')
  clearLogs();
  let stuLogs = $('#logs'); // get the current set of logs
  let newHtml = ``;
  for (let log of logs) {
    newHtml += `
      <li>
        <div><small>${log.date}</small></div>
        <pre><p>${log.text}</p></pre>
      </li>
    `;

    stuLogs.html(newHtml);

    // add hide/show events
    liEvents();
  }
}

// Add events to <li>'s
function liEvents() {
  // find ul with id of 'logs'
  let logsUl = $('#logs');
  let ulChildren = logsUl.children();
  // Loop through the logs and add the event listeners
  for (let child of ulChildren) {
    child.classList.add('cursor-pointer', 'bg-primary-200', 'rounded', 'my-2', 'p-2', 'dark:bg-primary-500')
    child.addEventListener('click', function () {
      if (child.children[1].classList.contains('hidden')) {
        // if it is hidden
        child.children[1].classList.remove('hidden');
      } else {
        // if it is shown
        child.children[1].classList.add('hidden');
      }
    });
  }
}

async function addLog() {
  // this function adds new logs into the db
  // get the course id, stuId, and text in the text area and PUT it in the db
  let cId = $('#course').val();
  let stuId = $('#uvuId').val();
  let text = $('#txtArea').val();
  let date = new Date();

  try {
    console.log('try to log a new log'); // try to log a new log
    const result = await axios.post(`${URL}${API_ROUTE}logs`, {
      courseId: cId,
      uvuId: stuId,
      date:
        date.getDate() +
        '/' +
        (date.getMonth() + 1) +
        '/' +
        date.getFullYear() +
        ' @ ' +
        date.getHours() +
        ':' +
        date.getMinutes() +
        ':' +
        date.getSeconds(),
      text: text,
      headers: {
        'Content-type': 'application/json',
      },
    });
    console.log('successfully logged a log'); // successfully did it
  } catch (error) {
    console.error(error);
  }

  // reload logs
  $('#txtArea').val('')
  let logBtn = document.getElementById('submitBtn');
  logBtn.disabled = true
  logBtn.classList.remove('cursor-pointer')
  logBtn.classList.add('cursor-not-allowed')
  let logs = await getLogs(stuId);
  populateLogs(logs);
}

function getPref () {
  // get the dark/light mode preference of local storage load that theme.
  let pref = 'light';
  
  // OS preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    pref = 'dark'
    console.log('OS Pref: ', pref)
  } 
  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    pref = 'light'
    console.log('OS Pref: ', pref)
  } 

  // browser
  console.log('Browser Pref: ', pref)
  
  // local storage
  if (localStorage.getItem('theme')) pref = localStorage.getItem('theme')
  else console.log('User Pref: ', 'unknown')
    // default
  return pref
}

function addPref (pref) {
  // store the user's dark/light mode preference in local storage.
  localStorage.setItem('theme', pref)
}