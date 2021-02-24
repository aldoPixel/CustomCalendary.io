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

    if (uniqueDates.size >= 22) {
      if (relativeSize % 7 > 0) {
        $(".last").each((index, element) => {
          const autoDays = 7 - (relativeSize % 7);
          const lDate = new Date($(element).attr("data-val"));
          for (let i = 0; i < autoDays; i++) {
            lDate.setDate(lDate.getDate() + 1);
            $(`.day[data-val="${lDate.toISOString().slice(0, 10)}"]`).addClass(
              "autocomplete"
            );
          }
          $(element)
            .nextAll(".day")
            .slice(0, autoDays)
            .addClass("autocomplete");
        });
      }
    }

    document.getElementById("check_out").value = `${dateString}`;
    document.getElementById("n_nights").value = `${relativeSize}`;
  });

  whenInstance.on("firstDateSelect:after", (dateString) => {
    document.getElementById("check_in").value = `${dateString}`;
    $(".dis-tmp").click(() =>
      Swal.fire({
        title: "Error",
        text: "Dates Not Available",
        icon: "error",
      })
    );
  });

  whenInstance.on("firstDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
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
  });

  $(".icon.icon-left-triangle").click(() => {
    for (let i = 0; i < blockedDays.length; i++) {
      $(`.day[data-val='${blockedDays[i]}']`).addClass("disabled-custom");
    }

    for (let i = 0; i < disables.length; i++) {
      disables[i].addEventListener("click", clickLockedDays);
    }
  });
});
