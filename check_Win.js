const { execSync } = require("child_process");
const fs = require("fs");
const TCP_CHECK_COMMAND = "tshark.exe -i Ethernet -c 100 host 192.168.0.10";
const createFile = (name) => {
  try {
    execSync(` fc > ${name} 2>$null `);
  } catch (err) {}
};
const sortObj = (obj) => {
  return Object.fromEntries(Object.entries(obj).sort(([, a], [, b]) => b - a));
};
//###################################// INIT

createFile("stats.json");

//###################################// INIT

//###################################// LOOP
while (true) {
  let outOfExec = execSync(TCP_CHECK_COMMAND).toString();
  let ipList = countIpToList(recognizeIP(outOfExec));
  const currentStateOfMonitoring = fs.readFileSync("stats.json", "utf-8");
  if (currentStateOfMonitoring) {
    let currentListOfIP = JSON.parse(currentStateOfMonitoring);
    let collizedObject = checkCollizions(ipList, currentListOfIP);
    fs.writeFileSync(
      "stats.json",
      JSON.stringify(sortObj(collizedObject), null, "\t")
    );
  } else {
    fs.writeFileSync("stats.json", JSON.stringify(ipList, null, "\t"));
  }
}
//###################################// LOOP

//###################################// FUNCTIONS

function checkCollizions(obj1, obj2) {
  for (const key in obj1) {
    if (
      Object.hasOwnProperty.call(obj1, key) &&
      Object.hasOwnProperty.call(obj2, key)
    ) {
      obj1[key] += obj2[key];
    }
  }
  return Object.assign(obj2, obj1);
}

function recognizeIP(data) {
  return (
    data
      .split("\n")
      .map((e) => e.match(/\d+\.\d+\.\d+\.\d+/))
      // .filter((e) => e != "192.168.0.13")
      .join("\n")
  );
}

function countIpToList(log) {
  const logArray = log.split("\n").filter((e) => e);
  return mapArr(logArray);
}

function mapArr(arr) {
  return arr.reduce((acc, cur) => {
    if (!acc[cur]) acc[cur] = 1;
    else acc[cur] += 1;
    return acc;
  }, {});
}

//###################################// FUNCTIONS
