const baseURL = "https://www.linkedin.com/in/";
let btnElement = document.querySelector(".fetch");
const fetchUserInfo = async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab.url.includes(baseURL)) {
    console.error("Not a linkedin page!");
    return;
  }
  try {
    btnElement.setAttribute("disabled", true);
    btnElement.textContent = "Fetching Info..";
    const result = await fetch("https://randomuser.me/api/").then((res) =>
      res.json()
    );
    injectHtmlWithData(tab.id, result.results[0]);
  } catch (err) {
    console.log(err);
  } finally {
    btnElement.removeAttribute("disabled");
    btnElement.textContent = "Inject User Info";
  }
};

function renderHTML(data) {
  const { gender, name, location, email, dob, phone, picture } = data;

  const userInfoCard = document.querySelector(
    ".profile-detail .user-info-card"
  );

  if (userInfoCard) {
    userInfoCard.remove();
  }

  let dataToShow = [
    {
      label: "Name",
      value: `${name.title} ${name.first} ${name.last}`,
    },
    { label: "Gender", value: gender },
    {
      label: "Email",
      value: email,
      html: `<a href="mailto:${email}">${email}</a>`,
    },
    {
      label: "Location",
      value: `${location.street.name}, ${location.city}, ${location.country}`,
    },
    { label: "DOB", value: new Date(dob.date).toLocaleDateString() },
    {
      label: "Phone",
      value: phone,
      html: `<a href="tel:${phone}">${phone}</a>`,
    },
  ];

  let li = dataToShow.reduce(
    (prev, curr) =>
      prev +
      `<p class="t-14 pb2">- ${curr.label}: &nbsp; ${
        curr.html ? curr.html : curr.value
      }</p>`,
    ""
  );

  const card = `<div class="user-info-card pv-profile-section artdeco-card p5 mt4 ember-view">
    <h2 class="pv-profile-section__card-heading">
    User Info
    </h2>
    <div style="display:grid;grid-template-columns: repeat(2, 1fr);gap: 16px" class="user-content mt4">${li}</div>
    </div>`;

  document
    .querySelector(".profile-detail")
    .insertAdjacentHTML("afterbegin", card);
}

const injectHtmlWithData = async (tabId, data) => {
  chrome.scripting.executeScript({
    target: { tabId },
    func: renderHTML,
    args: [data],
  });
};

btnElement.addEventListener("click", fetchUserInfo);
