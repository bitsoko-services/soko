function merchPhoneNo() {
    activeStore = localStorage.getItem("soko-active-store");
    storeID = JSON.parse(localStorage.getItem("soko-store-id-" + activeStore)).phone;
    $("#phoneNo").attr("href", "tel:" + storeID);
    if (managerId == shopOwner) {
        $("#phoneNo").attr("href", "tel:+25432207087");
    }
}
