<template>
    <div class = "ui grid">
        <div class = "six wide column"> 
                <form class = "ui segment large form">
                    <div class ="ui message red" v-show="error">{{error}}</div>
                    <div class = "ui segment">
                        <div class ="field">
                            <div class ="ui right icon input large" :class="{loading:spinner}">
                            <input type="text" placeholder="Please enter your location" v-model = "address"
                                ref="autocomplete"
                            />
                            <i class = "dot circle link icon" @click = "locatorButtonPressed"></i>
                            </div> 
                        </div>
                        <div class="field">
                            <div class="two fields">
                                <div class="field">
                                    <select v-model="type">
                                        <option value="restaurant">Restaurant</option>
                                    </select>
                                </div>
                                <div class="field">
                                    <select v-model="radius">
                                        <option value="5">5km</option>
                                        <option value="10">10km</option>
                                        <option value="15">15km</option>
                                        <option value="20">20km</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button class = "ui large red centered button" @click="findNearBy" :style="{width:'255px'}">Find nearby places</button>
                    </div>
                </form>
                    <div class="ui segment" style="max-height:900px;overflow:auto;">
                        <div class="ui divided items">
                            <div class ="item" v-for="(place,index) in places" :key="place.id" @click="showInfoWindow(index)" 
                                :class="{'active':activeV===index}" style="padding:10px;"
                            >
                                <div class ="content">
                                    <div class ="header">{{place.name}}</div>
                                    <div class ="meta">{{place.vicinity}}</div>
                                </div>
                            </div>
                        </div>
                    </div>
        </div>
        <div class = "ten wide column" ref="map"></div>
    </div>
</template>


<script>
import axios from 'axios';


export default {
    data(){
        return{
            address:"",
            error:"",
            spinner: false,
            apiKey: "AIzaSyBLv10Y3bpIJKxZHykJLeK9Gpn5VRxYO7g",
            lat:0,
            lng:0,
            type:'',
            radius:'',
            places:[],
            markers:[],
            activeV:-1
        }
    },

    mounted(){
        let auto = new window.google.maps.places.Autocomplete(this.$refs["autocomplete"],
            {
                bounds: new window.google.maps.LatLngBounds(
                    new google.maps.LatLng(45,-122)
                )
            }
        );
        auto.addListener("place_changed", ()=>{
            let place = auto.getPlace();
            this.address = place.formatted_address;
            this.lat = place.geometry.location.lat();
            this.lng = place.geometry.location.lng();
        });

            // document.getElementById("autocomplete"),
            // {
            //     bounds: new window.google.maps.LatLngBounds(
            //         new window.google.maps.LatLng(47.6,122.33)
            //     )
            // }
        
    },

    methods:{
        locatorButtonPressed(){
            this.spinner = true;
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(position=>{
                    this.lat = position.coords.latitude
                    this.lng = position.coords.longitude
                    this.getAddressFrom(position.coords.latitude, position.coords.longitude);
                    // this.showUserLocationOnTheMap(position.coords.latitude,position.coords.longitude);
                }, 
                error=>{
                    this.spinner = false;
                    this.error = error.message;
                    console.log(error.message);
                })
            }else{
                this.spinner = false;
                this.error = error.message;
                console.log("Geolocation API failed");
            }
        } ,
        getAddressFrom(lat,long){
            axios.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+long+"&key=AIzaSyBLv10Y3bpIJKxZHykJLeK9Gpn5VRxYO7g")
            .then(response=>{
                if(response.data.error_message){
                    this.spinner = false;
                    this.error = response.data.error_message;
                    console.log(response.data.error_message);
                }else{
                    this.address = response.data.results[0].formatted_address
                    this.spinner = false;
                }
            })
            .catch(error=>{
                this.spinner = false;
                this.error = error.message;
                console.log(error.message);
            })
        },

        // showUserLocationOnTheMap(lat,long){
        //     let map = new window.google.maps.Map(document.getElementById("map"),
        //     {zoom:15,
        //      center:new window.google.maps.LatLng(lat,long),
        //      mapTypeId: window.google.maps.MapTypeId.ROADMAP
        //     });

        //     new window.google.maps.Marker({
        //         position: new window.google.maps.LatLng(lat,long),
        //         map:map
        //     });
        // },

        findNearBy(){
            const URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${this.lat},${this.lng}&type=${this.type}&radius=${this.radius * 1000}&key=${this.apiKey}`;

            axios.get(URL).then(response=>{
                this.places = response.data.results;
                this.showOnMap();
                console.log(response);
            })
            .catch(error=>{
                this.error = error.message;
            });
        },

        showOnMap() {
            const map = new window.google.maps.Map(
                this.$refs["map"],
                {
                    zoom:15,
                    center:new window.google.maps.LatLng(this.lat,this.lng),
                    mapTypeId: window.google.maps.MapTypeId.ROADMAP
                }
            );

            const infoWindow = new window.google.maps.InfoWindow();

            for (let i = 0; i < this.places.length;i++){
                const lat = this.places[i].geometry.location.lat;
                const lng = this.places[i].geometry.location.lng;
                const placeID = this.places[i].place_id;

                const marker = new window.google.maps.Marker({
                    position:new window.google.maps.LatLng(lat,lng),
                    map:map
                });
                this.markers.push(marker);
                window.google.maps.event.addListener(
                    marker,
                    "click",
                    () => {
                        const URL = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?key=${this.apiKey}&place_id=${placeID}`;

                        axios.get(URL).then(response=>{
                            if(response.data.error_message){
                                this.error = response.data.error_message;
                            }else{
                                const place = response.data.result;
                                infoWindow.setContent(`<div class="ui header">${place.name}</div>
                                    ${place.formatted_address}
                                    ${place.formatted_phone_number}<br>
                                    <a href = "${place.website}" target="_blank">official website</a>

                                    `
                                );
                                infoWindow.open(map,marker);
                            }
                        })
                        .catch(error => {
                            this.error = error.message;
                        });
                    }
                );
            }
        },

        showInfoWindow(index){
            this.activeV = index;
            new window.google.maps.event.trigger(
                this.markers[index], "click"
            );
        }

    }
};
</script>

<style>
.ui.botton, 
.dot.circle.icon{

    background-color: red;
    color : white;

}
.pac-icon{
    display:none;
}
.pac-item{
    padding:10px;
    font-size:16px;
    cursor:pointer;
}

.pac-item:hover{
    background-color:grey;
}

#map{
    position:absolute;
    top:0;
    right:0;
    left:0;
    bottom:0;
    background: red;
}

.active{
    background: grey !important; 
}
</style>