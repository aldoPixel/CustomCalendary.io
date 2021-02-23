const hoverLocked = ({
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

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  let blockedDays = JSON.parse(localStorage.getItem("blockedDays")) || [];
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
    disables[i].addEventListener(
      "click",
      ({
        target: {
          dataset: { val },
        },
      }) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Date ${val} Not Available`,
        });
      }
    );
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

    if (uniqueDates.size >= 22) {
      if (relativeSize % 7 > 0) {
        $(".last").each((index, element) => {
          $(element)
            .nextAll(".day")
            .slice(0, 7 - (relativeSize % 7))
            .addClass("autocomplete");
        });
        //.last()
        //.nextAll(".day")
        //.slice(0, 7 - (relativeSize % 7))
        //.addClass("autocomplete");
      }
    }

    document.getElementById("check_out").value = `${dateString}`;
    document.getElementById("n_nights").value = `${relativeSize}`;
  });

  whenInstance.on("firstDateSelect:after", (dateString) => {
    document.getElementById("check_in").value = `${dateString}`;
  });

  whenInstance.on("firstDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
  });

  document.getElementById("create_event").addEventListener("click", () => {
    blockedDays.push(...selectedTemp);
    localStorage.setItem("blockedDays", JSON.stringify(blockedDays));
    window.location.reload();
  });
});
