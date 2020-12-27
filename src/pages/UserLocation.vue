<template>
    <div>
        <section class = "ui two column centered grid" style = "position:relative;z-index:1;"> 
            <div class = "column">
                <form class = "ui segment large form">
                    <div class ="ui message red" v-show="error">{{error}}</div>
                    <div class = "ui segment">
                        <div class ="field">
                            <div class ="ui right icon input large" :class="{loading:spinner}">
                            <input type="text" placeholder="Please enter your location" v-model = "address"
                                id="autocomplete"
                            />
                            <i class = "dot circle link icon" @click = "locatorButtonPressed"></i>
                            </div> 
                        </div>
                        <div class ="field" >
                            <button class = "ui large centered button" :style="{width:'365px'}">Go</button>
                        </div>
                        
                    </div>
                    
                </form>
            </div>
            <!-- <div class = "column blue"></div> -->
        </section>

        <section id = "map"> </section>
    </div>
</template>

<script>
import axios from 'axios';


export default {
    data(){
        return{
            address:"",
            error:"",
            spinner: false
        }
    },

    mounted(){
        let auto = new window.google.maps.places.Autocomplete(document.getElementById("autocomplete"),
            {
                bounds: new window.google.maps.LatLngBounds(
                    new google.maps.LatLng(45,-122)
                )
            }
        );
        auto.addListener("place_changed", ()=>{
            let place = auto.getPlace();
            this.showUserLocationOnTheMap(place.geometry.location.lat(), place.geometry.location.lng());
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
                    this.getAddressFrom(position.coords.latitude, position.coords.longitude);
                    this.showUserLocationOnTheMap(position.coords.latitude,position.coords.longitude);
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

        showUserLocationOnTheMap(lat,long){
            let map = new window.google.maps.Map(document.getElementById("map"),
            {zoom:15,
             center:new window.google.maps.LatLng(lat,long),
             mapTypeId: window.google.maps.MapTypeId.ROADMAP
            });

            new window.google.maps.Marker({
                position: new window.google.maps.LatLng(lat,long),
                map:map
            });
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
</style>