document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  let blockedDays = JSON.parse(localStorage.getItem("blockedDays")) || [];

  let whenInstance = new When({
    container: document.getElementById("picker-input"),
    keyboardEvents: true,
    inline: true,
    double: true,
    minDate: new Date(),
    disabledDates: blockedDays,
  });

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
    const selected =
      document.querySelectorAll(".day.activeRange").length > 0
        ? document.querySelectorAll(".activeRange")
        : document.querySelectorAll(".active");
    console.log(selected);
    let dates = [];
    for (let i = 0; i < selected.length; i++) {
      const {
        dataset: { val },
      } = selected[i];
      val != undefined && dates.push(val);
    }

    const uniqueDates = new Set(dates);
    console.log(uniqueDates);
    blockedDays.push(...uniqueDates);

    if (uniqueDates.size >= 21) {
      $(".last").last().nextAll(".day").slice(0, 7).addClass("autocomplete");
    }

    let relativeSize = uniqueDates.size - 2;
    if (relativeSize <= 3) {
      document.getElementById("n_nights").value = 1;
    } else {
      relativeSize % 2 == 0
        ? (document.getElementById("n_nights").value = relativeSize)
        : (document.getElementById("n_nights").value = relativeSize - 1);
    }
    //document.getElementById("check_out").value = `${dateString}`;
    //document.getElementById("n_nights").value = Math.floor(
    //uniqueDates.size / 2
    //);
  });

  whenInstance.on("firstDateSelect:after", (dateString) => {
    document.getElementById("check_in").value = `${dateString}`;
  });

  whenInstance.on("firstDateSelect:before", (dateString) => {
    $(".autocomplete").removeClass("autocomplete");
  });

  document.getElementById("create_event").addEventListener("click", () => {
    localStorage.setItem("blockedDays", JSON.stringify(blockedDays));
    window.location.reload();
  });
});
