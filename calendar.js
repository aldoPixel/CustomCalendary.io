const clickLockedDays = ({
  target: {
    dataset: { val },
  },
}) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: `Date ${val} Not Available`,
  });
};

const noSelectDates = () =>
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Dates Not Available",
  });

const resetDismissValue = () => {
  $(".activeRange").removeClass("activeRange");
  $(".active").removeClass("active");
  $(".first").removeClass("first");
  $(".last").removeClass("last");
  dismissableDaily = true;
  relativeSize = 0;
  selectedTemp = [];
  document.getElementById("check_out").value = "";
  document.getElementById("code-to").innerText = "";
  document.getElementById("n_nights").value = "";
  document.getElementById("check_in").value = "";
  document.getElementById("code-from").innerText = "";
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  let blockedDays = JSON.parse(localStorage.getItem("blockedDays")) || [];
  let minNights = localStorage.getItem("minNights") || 0;
  let maxNights = localStorage.getItem("maxNights") || 100;
  let dismissableDaily = false;
  const mode = localStorage.getItem("mode")
    ? localStorage.getItem("mode")
    : "weekly";
  let selectedTemp = [];
  let whenInstance = new When({
    container: document.getElementById("picker-input"),
    keyboardEvents: true,
    inline: true,
    double: true,
    minDate: new Date(),
    disabledDates: blockedDays,
  });

  for (let i = 0; i < blockedDays.length; i++) {
    $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
  }

  const disables = document.getElementsByClassName("disable-day");

  for (let i = 0; i < disables.length; i++) {
    disables[i].addEventListener("click", clickLockedDays);
  }

  whenInstance.on("secondDateSelect:after", (dateString) => {
    selectedTemp = [];
    const selected =
      $(".activeRange").length > 0
        ? document.querySelectorAll(".activeRange")
        : document.querySelectorAll(".active");
    let dates = [];
    for (let i = 0; i < selected.length; i++) {
      const {
        dataset: { val },
      } = selected[i];
      val != undefined && dates.push(val);
    }

    const uniqueDates = new Set(dates);
    selectedTemp.push(...uniqueDates);
    let relativeSize = uniqueDates.size - 1 > 0 ? uniqueDates.size - 1 : 1;

    if (mode === "weekly") {
      if (uniqueDates.size >= 22) {
        if (relativeSize % 7 > 0) {
          $(".last").each((index, element) => {
            let autoDays = 7 - (relativeSize % 7);
            const lDate = new Date($(element).attr("data-val"));
            const isLeap = new Date(lDate.getFullYear(), 1, 29).getMonth() == 1;
            if (
              !isLeap &&
              lDate.getMonth() === 2 &&
              (lDate.getDate() === 29 || lDate.getDate() === 30)
            ) {
              autoDays += 1;
            }
            for (let i = 0; i < autoDays; i++) {
              lDate.setDate(lDate.getDate() + 1);
              $(
                `.day[data-val="${lDate.toISOString().slice(0, 10)}"]`
              ).addClass("autocomplete");
            }
            $(element)
              .nextAll(".day")
              .slice(0, autoDays)
              .addClass("autocomplete");
          });
        }
      }
    }

    if (mode === "daily") {
      if (relativeSize > 31) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "You Can't Select More Than 31 Nights",
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            resetDismissValue();
          }
        });
      }
    }

    if (relativeSize < minNights) {
      dateString !== null &&
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `You must select at least ${minNights} Nights`,
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            resetDismissValue();
          }
        });
    }

    if (relativeSize > maxNights) {
      dateString !== null &&
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `You can't select more than ${maxNights} Nights`,
        }).then((result) => {
          if (result.isConfirmed || result.isDismissed) {
            resetDismissValue();
          }
        });
    }

    document.getElementById("check_out").value = `${dateString}`;
    document.getElementById("code-to").innerText = `${dateString}`;
    document.getElementById("n_nights").value = `${relativeSize}`;
  });

  whenInstance.on("firstDateSelect:after", (dateString) => {
    document.getElementById("check_in").value = `${dateString}`;
    document.getElementById("code-from").innerText = `${dateString}`;
  });

  whenInstance.on("firstDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
    dismissableDaily = false;
  });

  document.getElementById("create_event").addEventListener("click", () => {
    blockedDays.push(...selectedTemp);
    localStorage.setItem("blockedDays", JSON.stringify(blockedDays));
    window.location.reload();
  });

  $(".icon.icon-right-triangle").click(() => {
    for (let i = 0; i < blockedDays.length; i++) {
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    for (let i = 0; i < disables.length; i++) {
      disables[i].addEventListener("click", clickLockedDays);
    }

    if (mode === "daily" && dismissableDaily) {
      $(".activeRange").removeClass("activeRange");
      $(".active").removeClass("active");
      $(".first").removeClass("first");
      $(".last").removeClass("last");
    }
  });

  $(".icon.icon-left-triangle").click(() => {
    for (let i = 0; i < blockedDays.length; i++) {
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    for (let i = 0; i < disables.length; i++) {
      disables[i].addEventListener("click", clickLockedDays);
    }

    if (mode === "daily" && dismissableDaily) {
      $(".activeRange").removeClass("activeRange");
      $(".active").removeClass("active");
      $(".first").removeClass("first");
      $(".last").removeClass("last");
    }
  });
});
