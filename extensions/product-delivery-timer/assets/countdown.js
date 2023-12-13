function countDown() {
  const days_per_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  function leapYear(year) {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  }

  function isValidDate(date) {
    const datePattern = /^\d{4}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;

    return datePattern.test(date);
  }

  function isValidTime(time) {
    const timePattern = /^(0?[0-9]|1[0-9]|2[0-3]):(0?[0-9]|[1-5][0-9])$/;

    return timePattern.test(time);
  }

  const countdownInterval = setInterval(() => {
    let end_date = document.querySelector(".end-date").textContent;
    end_date = end_date.split(" ").join("");
    let end_time = document.querySelector(".end-time").textContent;
    end_time = end_time.split(" ").join("");

    const userDateTime = `${end_date} ${end_time}`;
    let end_date_time = new Date(`${end_date} ${end_time}`).getTime();

    const current_date_time = new Date().getTime();
    let remainingTime = end_date_time - current_date_time;
    let remainingTimeInSec = remainingTime / 1000;

    const closePopupButton = document.querySelector(".close-popup-icon");
    const popup = document.querySelector(".invalide__input-popup");

    let message = document.querySelector(".popup-show-message");
    let messagEndDate = document.querySelector(".popup-show-message-enddate");

    function closePopup() {
      popup.style.display = "none";
    }

    if (isNaN(remainingTimeInSec)) {
      messagEndDate.setAttribute("style", "display: none");
    } else {
      message.setAttribute("style", "display: none");
    }

    closePopupButton.addEventListener("click", closePopup);
    if (
      remainingTimeInSec <= 0 ||
      !isValidDate(end_date) ||
      !isValidTime(end_time)
    ) {
      clearInterval(countdownInterval);
      document.querySelector(".countdown-day").innerHTML = 0;
      document.querySelector(".countdown-hours").innerHTML = 0;
      document.querySelector(".countdown-minutes").innerHTML = 0;
      document.querySelector(".countdown-seconds").innerHTML = 0;
      popup.style.display = "flex";

      return;
    }

    let temp_date = end_date.split("-");
    let temp_month = Number(temp_date[1]);
    let temp_year = Number(temp_date[0]);

    if (leapYear(temp_year)) {
      days_per_month[1] += 1;
    }

    let temp_day = Math.min(
      Number(temp_date[2]),
      days_per_month[temp_month - 1]
    );
    end_date = `${temp_year}-${temp_month}-${temp_day}`;
    end_date_time = new Date(`${end_date} ${end_time}`).getTime();

    remainingTime = end_date_time - current_date_time;
    remainingTimeInSec = remainingTime / 1000;

    const days = Math.floor(remainingTimeInSec / (60 * 60 * 24));
    remainingTimeInSec = Math.floor(remainingTimeInSec % (60 * 60 * 24));
    const hours = Math.floor(remainingTimeInSec / (60 * 60));
    remainingTimeInSec = Math.floor(remainingTimeInSec % (60 * 60));
    const minutes = Math.floor(remainingTimeInSec / 60);
    const seconds = Math.floor(remainingTimeInSec % 60);

    let countdownDay = `${days}`;
    const countdownHours = `${hours}`;
    const countdownMinutes = `${minutes}`;
    const countdownSeconds = `${seconds}`;
    document.querySelector(".countdown-day").innerHTML = countdownDay;
    document.querySelector(".countdown-hours").innerHTML = countdownHours;
    document.querySelector(".countdown-minutes").innerHTML = countdownMinutes;
    document.querySelector(".countdown-seconds").innerHTML = countdownSeconds;
  }, 1000);
}
countDown();
document.addEventListener("shopify:section:load", () => countDown());
