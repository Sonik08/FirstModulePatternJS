
let DataController = (function(){

    let Hotel = function(id, name, rating, city, thumbnail, guestrating, ratings, mapurl, filters, price){
        this.id = id;
        this.name = name;
        this.stars = rating;//0 stars filter property
        this.city = city; //1 city filter property
        this.thumbnail = thumbnail;
        this.guestRating = guestrating;
        this.ratings = ratings; 
        this.guest = ratings.text; //2  guest filter property
        this.mapURL = mapurl;
        this.filters = filters;
        this.price = price; //3 price filter property
        this.filtersValues = new Filters();
    }
    let Filters = function(){
        this.price = false; //check
        this.stars = false;// check
        this.guest = false; // check
        this.city = false;//check
    }
    Filters.prototype.isFiltered =  function(){
        return (this.price || this.stars || this.guest || this.city);
    }
    let data = {
        roomTypes: [],
        hotels: []
    }
    
    let addRoomTypes = function(roomTypesObj){
        let names = getArrayNames(roomTypesObj.roomtypes);
        data.roomTypes.push.apply(data.roomTypes,names);
    }
    let getArrayNames = function(array){
        let nameArray = [];
        for(let i = 0; i < array.length; i++){
            nameArray.push(array[i].name);
        }
        return nameArray;
    }
    let addHotels = function(entries){
        let ID, newHotel;
            ID = data.hotels.length;
            entries.entries.forEach(hotel => {
            filterNames = getArrayNames(hotel.filters);

            newHotel = new Hotel(ID, hotel.hotelName, hotel.rating, hotel.city, hotel.thumbnail, hotel.guestrating, hotel.ratings, hotel.mapurl, filterNames, hotel.price);
            data.hotels.push(newHotel);
            ID++;
        });
    }

    let dataParse = function(){ 
        //method can be moved outsid the controller
        // and Main controller init() function added to the done section
        $.ajax({
            url: 'assignmentJSON.txt',
            dataType: 'json',
            async: false,
        }).done(function(data){ 
            //Add roomTypes
            addRoomTypes(data[0])
            //Add  hotels
            addHotels(data[1])
        })
    }
    let arrayLoop = function(array, callbackFunc){
        for(let i = 0, len = array.length; i < len; i++){
            callbackFunc(array[i]);
        }
    }

    let priceFilter = function(propertyName, filterValue){
        arrayLoop(data.hotels, function(hotel){
            const hotelPrice = parseInt(hotel[propertyName]);
            filterValue = parseInt(filterValue);
            if(hotelPrice <= filterValue)
                hotel.filtersValues[propertyName] = false;
            else
                hotel.filtersValues[propertyName] = true;
        })
    }
    let simpleFilter = function(propertyName, filterValue){
        arrayLoop(data.hotels, function(hotel){
            if(propertyName === 'stars' && filterValue !== 'All')
                filterValue = parseInt(filterValue);
            if(hotel[propertyName] === filterValue || filterValue === 'All')
                hotel.filtersValues[propertyName] = false;
            else
                hotel.filtersValues[propertyName] = true;
        })
    }
    let getfilterValues = function(){
        let filterValues = [];
        arrayLoop(data.hotels, function(hotel){
            filterValues.push(hotel.filtersValues.isFiltered())
        })
        return filterValues;
    }

    return {

        loadData: function(){
            dataParse();
        },
        getHotelData: function(){
            return data.hotels;
        },
        getRoomTypeData: function(){
            return data.roomTypes;
        },
        getCities: function(){
            let nameArray=[];
            arrayLoop(data.hotels, function(currentHotel){
                if(!nameArray.includes(currentHotel.city)){
                    nameArray.push(currentHotel.city);
                }
            })
            return nameArray;
        },
        getHotelFilters: function(){
            let hotelFilters = [];
            arrayLoop(data.hotels, function(currEl){
                hotelFilters.push(currEl.filters);
            })
            return hotelFilters;
        },
        getFiltersArr: function(){ 
            let filterArray = [];
            arrayLoop(data.hotels, function(currentHotel){
                arrayLoop(currentHotel.filters, function(currFilter){
                    if(!filterArray.includes(currFilter)){
                        filterArray.push(currFilter);
                    }
                })
            })
            return filterArray;
        },
        filterHotels: function(propertyName, filterValue){
            if(propertyName === 'price')
                priceFilter(propertyName, filterValue);
            else
                simpleFilter(propertyName, filterValue);    

            return getfilterValues();
            }
            
        ,
        testing: function(){
            return data;
        },
        getPrices: function(){
            let prices = data.hotels.map(el => {
                return el.price;
            })
            return prices;
        }
    }
})();
let UIController = (function(){
    let DOMStrings = {
        //room types elements
        roomTypes: '.roomTypesDropDwn',
        //price slider
        priceSlider: '.slider',
        sliderLabel: '.priceSlider',
        //hotel elements
        hotelsContainer: '.hotels',
        hotelContainer: '.hotel',
        hotelGuestRating: '.rating_reviews',
        hotelCity: '.hotelCity',
        hotelStars: '.hotelStarRating',
        hotelPrice: '.priceTag',
        //guest DropDown
        guestContainer: '.dropdownGuestHeader',
        guestRatingBtn: '.guestRating',
        guestAllBtn: '.guestAllBtn',
        //cities dropDown
        citiesContainer: '.dropDownCityHeader',
        cityFilterBtn: '.cityFilter',
        cityAllBtn: '.cityAllBtn',
        cityList: '.dropDownCity',
        //stars dropDown
        starContainer: '.dropdownStarHeader',
        starRatingBtn: '.starRating',
        starAllBtn: '.starAllBtn',
        //Sort dropDown
        sortByFilter: '.sortByFilter',
        sortContainer: '.dropdownSortHeader',
        sortByBtn: '.sortByBtn',
        sortAllBtn: '.sortAllBtn',
        searchBox: '.searchBox'

    }
    countStars = function(rating){
        let starsElement = '';
        for ( let i = 0 ; i < 5; i++){
            if (i + 1 <= rating)
                starsElement += '<span class="fa fa-star checked"></span>';
            else
                starsElement += '<span class="fa fa-star"></span>';
        }
        return starsElement;
    }
    let arrayLoop = function(array, callbackFunc){
        for(let i = 0, len = array.length; i < len; i++){
            callbackFunc(array[i], i);
        }
    }
    return {
        
        displayRoomTypes : function(roomTypesArray){
            //select the dropdownlist
            let roomsDropDown = document.querySelector(DOMStrings.roomTypes);
            //append each room type to drop down
            arrayLoop(roomTypesArray, function(currType){
                //let html = HTMLStrings.getRoomType(currType);
                let html = `<button class="dropdown-item roomType" type="button" value = '${currType}'>${currType}</button>`;
                roomsDropDown.insertAdjacentHTML('beforeend', html);
            })
        },
        autoComplete: function(citiesArray){
            $( function() {
                $(DOMStrings.searchBox).autocomplete({
                  source: citiesArray
                });
              } );
        },
        displayHotels: function(hotelsArray){
            //select hotel container
            let hotelsContainer = document.querySelector(DOMStrings.hotelsContainer);
            //append each hotel to the list
            arrayLoop(hotelsArray, function(currHotel){
                stars = countStars(currHotel.stars);
                let html = `<div class = 'row hotel'><div class = 'col-3 container-fluid hotelPicture'><img class = 'picture'src="${currHotel.thumbnail}"></div><div class = 'col-4 hotelInfo'><div class = 'container'><h4 class= 'hotelInfoTitle'>${currHotel.name}</h4><div class= 'hotelStarRating' value='${currHotel.stars}'>${currHotel.rating}</div>${stars}<span class = 'hotelCity' value= '${currHotel.city}'>${currHotel.city}</span><span class = 'distanceToHotel'>, 0.2 miles to Champ Elies</span> <br><span>${currHotel.ratings.no} </span><span class = 'rating_reviews' value = '${currHotel.ratings.text}'>${currHotel.ratings.text}</span> <br></div></div><div class = 'col-2 priceInfo'><ul class = 'priceList'><li class = 'priceListItem'><span class='websiteName'>Site 1 </span><span class = 'websitePrice'>500</span></li><li class = 'priceListItem'><span class='websiteName'>Site 2 </span><span class = 'websitePrice'>600</span></li><li class = 'priceListItem'><span class='websiteName'>Site 3</span><span class = 'websitePrice'>700</span></li></ul><span class = 'morePrices'>More Prices from 400</span></div><div class = 'col-3 hotelBestPrice'><h4>Best Price <br><span class='priceTag'>${currHotel.price}</span>$</h4></div></div>`;
                hotelsContainer.insertAdjacentHTML('beforeend', html);
            })
        },
        addCitiesFilter: function(citiesArray){
            //select cities container
            let citiesContainer = document.querySelector(DOMStrings.cityList);
            arrayLoop(citiesArray, function(currCity){
                let html = `<button class="dropdown-item cityFilter" type="button" value = '${currCity}'>${currCity}</button>`;
                citiesContainer.insertAdjacentHTML('beforeend', html);
            })
        },
        addSortByFilter: function(sortByFiltersArr){
            arrayLoop(sortByFiltersArr, function(curr){
                let sortByFilter = document.querySelector(DOMStrings.sortByFilter);
                let html = `<button class="dropdown-item sortByBtn" type="button" value = '${curr}'>${curr}</button>`;
                sortByFilter.insertAdjacentHTML('beforeend', html);
            });
        },
        selectFilter: function(btnSelected, dropDownAllBtn, dropDownHeader){
            let allBtn = document.querySelector(dropDownAllBtn); //select the all btn
            if(btnSelected.value === 'All')  //if btn selected is all 
                allBtn.classList.add('d-none'); //hide all btn
            else
                allBtn.classList.remove('d-none'); //else show it 
            //  1 guest Rating button changes from 'All' to filter Selected
            let dropDownHead = document.querySelector(dropDownHeader);// select head element 
                dropDownHead.textContent = btnSelected.value; //change cur value based on selection
        },
        filterElement: function(filterReport, elemToUpdate, elemsContainer){
            let hotels = document.querySelectorAll(elemToUpdate);
            arrayLoop(hotels, function(hotel, index){
                if(filterReport[index])
                    $(hotel).parents(elemsContainer).addClass('d-none');
                else
                    $(hotel).parents(elemsContainer).removeClass('d-none');
                    
            })
        },
        sortBy: function(filterVal, hotelsFilters){ //should be moved to DataController
            let hotelsHTML = document.querySelector(DOMStrings.hotelContainer);
            let parent = hotelsHTML.parentNode;
            filterArrayNoPass = [];
            
            arrayLoop(hotelsFilters, function(currEl, index){
                if(!(currEl.includes(filterVal)))
                    filterArrayNoPass.push(parent.children[index])        
            })
            arrayLoop(filterArrayNoPass, function(currEl){
                parent.append(currEl)
            })
        },
        setSliderValues: function(prices){
            let slider = document.querySelector(DOMStrings.priceSlider);
            slider.max = Math.max(...prices);
            slider.min = Math.min(...prices);
            slider.value = slider.max;
            document.querySelector(DOMStrings.sliderLabel).innerText = slider.value;
        },
        sliderLabelChange: function(slider){
            document.querySelector(DOMStrings.sliderLabel).innerText = slider.value;
        },
        getDOMStrings: function(){
            return DOMStrings;
        }
    }
})();

let MainController = (function(DataCntrl, UICntrl, ){

    let DOM = UICntrl.getDOMStrings();

    let setupEventListeners = function(){
        //1 filter by Guest Rating
        addEventToClass(DOM.guestRatingBtn, 'click', filterByGuestRating);
        //2 filter by City
        addEventToClass(DOM.cityFilterBtn, 'click', filterByCity);
        //3 filter by stars
        addEventToClass(DOM.starRatingBtn, 'click', filterByStars);
        //4 filter by service filter values
        addEventToClass(DOM.sortByBtn, 'click', filterBySort);
        //5 on slider value change
        document.querySelector(DOM.priceSlider).addEventListener('change', filterByPrice);
    }


    // let cityFilter = DataCntrl.filterHotels.bind(DataCntrl, 'city');
    // let guestFilter = DataCntrl.filterHotels.bind(DataCntrl, 'guest');
    // let starsFilter = DataCntrl.filterHotels.bind(DataCntrl, 'stars');
    // let priceFilter = DataCntrl.filterHotels.bind(DataCntrl, 'price');

    let addEventToClass = function(classDOMString, eventToAdd, funcToExec ){
        const classList = document.querySelectorAll(classDOMString);
        for(let i = 0, len = classList.length;i < len; i++){
            classList[i].addEventListener(eventToAdd, funcToExec);
        }
    }
    let filterBySort = function(){
        UICntrl.selectFilter(this, DOM.sortAllBtn, DOM.sortContainer);
        let hotelFiltersArray = DataCntrl.getHotelFilters();
        UICntrl.sortBy(this.value, hotelFiltersArray);
    }
    let filterByGuestRating = function(){
        // A Button Part changes current header value of a dropdown and adds remve filter btn
        UICntrl.selectFilter(this, DOM.guestAllBtn, DOM.guestContainer );
        // B Hotel List Part hides hotels based on filter value
        //1 filtering is done in data controller 
        let filterReport = DataCntrl.filterHotels('guest', this.value);
        //2 filter report is passed to UI Cntrl
        UICntrl.filterElement(filterReport, DOM.hotelGuestRating, DOM.hotelContainer);
    }
    let filterByStars = function(){
        UICntrl.selectFilter(this, DOM.starAllBtn, DOM.starContainer);
        let filterReport = DataCntrl.filterHotels('stars', this.value);
        UICntrl.filterElement(filterReport, DOM.hotelStars, DOM.hotelContainer)
    }
    let filterByCity = function(){
        UICntrl.selectFilter(this, DOM.cityAllBtn, DOM.citiesContainer);
        let filterReport = DataCntrl.filterHotels('city', this.value);
        UICntrl.filterElement(filterReport, DOM.hotelCity, DOM.hotelContainer);
    }
    let filterByPrice = function(){
        UICntrl.sliderLabelChange(this);
        let filterReport = DataCntrl.filterHotels('price', this.value);
        UICntrl.filterElement(filterReport, DOM.hotelPrice, DOM.hotelContainer);
    }
    let autoComplete = function(){
        let citiesArray = DataCntrl.getCities();
        UICntrl.autoComplete(citiesArray);
    }
    let displayData = function(){
        //1 We need to get the JSON file and deserialize it and save the data into objects
        DataCntrl.loadData();
        //get and display room types
        let roomTypes = DataCntrl.getRoomTypeData();
        UICntrl.displayRoomTypes(roomTypes);
        //get and display hotels
        let hotels = DataCntrl.getHotelData();
        UICntrl.displayHotels(hotels);
        //Fill Filters
        let cities = DataCntrl.getCities();
        UICntrl.addCitiesFilter(cities);
        let filters = DataCntrl.getFiltersArr();
        UICntrl.addSortByFilter(filters);
        //Set min max value of a slider 
        let prices = DataCntrl.getPrices();
        UICntrl.setSliderValues(prices);
    }
    return {
        init : function(){
            console.log('Application has started!');
            displayData();
            setupEventListeners();
            autocomplete();
        }
    }
})(DataController, UIController);

MainController.init();
    
