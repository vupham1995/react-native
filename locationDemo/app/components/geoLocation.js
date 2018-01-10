import React, { Component } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    PermissionsAndroid,
    StyleSheet,
    Dimensions,
    TextInput,
    ListView
} from 'react-native';

import MapView from 'react-native-maps';
import Geocode from 'react-native-geocoder';

const { width, height } = Dimensions.get('window');

let ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 == !r2 });

export class GeoLocation extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isLoading: true,
            position: null,
            error: null,
            region: null,
            markerAddress: null,
            searchAddresses: null
        }

        this.onRegionChange = this.onRegionChange.bind(this);
        this.getCoordinate = this.getCoordinate.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.renderAddress = this.renderAddress.bind(this);
        this.geoPosition = this.geoPosition.bind(this);
        this.geoAddress = this.geoAddress.bind(this);
    }

    componentDidMount() {
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(rs => {
            console.log('ACCESS_FINE_LOCATION: ' + rs)
            if (rs)
                navigator.geolocation.getCurrentPosition(
                    position => {
                        let lat = position.coords.latitude;
                        let lon = position.coords.longitude;
                        let accuracy = position.coords.accuracy;

                        const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
                        const circumference = (40075 / 360) * 1000;

                        const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
                        const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters);
                        console.log(position.coords)
                        this.setState({
                            isLoading: false,
                            position: position.coords,
                            error: null,
                            region: {
                                latitude: lat,
                                longitude: lon,
                                latitudeDelta: Math.max(0.2, latDelta),
                                longitudeDelta: Math.max(0.2, lonDelta)
                            }
                        });

                        this.geoPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
                    },
                    error => {
                        console.error(error)
                        this.setState({
                            error: error
                        })
                    },
                    { enableHighAccuracy: true }
                )
        })
    }

    onRegionChange(region) {
        this.setState({ region });
    }

    getCoordinate(latlon) {
        let lat = latlon.latitude || latlon.lat;
        let lon = latlon.longitude || latlon.lng;
        let accuracy = 1;

        const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
        const circumference = (40075 / 360) * 1000;

        const latDelta = accuracy * (1 / (Math.cos(lat) * circumference));
        const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters);
        return {
            latitude: lat,
            longitude: lon,
            latitudeDelta: Math.max(0.2, latDelta),
            longitudeDelta: Math.max(0.2, lonDelta)
        }
    }

    onDragEnd(e) {
        let latlng = {
            lat: e.nativeEvent.coordinate.latitude,
            lng: e.nativeEvent.coordinate.longitude
        }
        e => { this.setState({ position: e.nativeEvent.coordinate }) }

        this.geoPosition(latlng);
    }

    geoPosition(latlng) {
        Geocode.geocodePosition(latlng).then(rs => {
            console.log(rs[0])
            this.setState({
                markerAddress: rs[0]
            })
        })
    }

    geoAddress(e) {
        let that = this;
        let text = e.nativeEvent.text;
        if (text !== null || text !== '')
            Geocode.geocodeAddress(text).then(rs => {
                console.log(rs)
                if (rs[0]) {
                    let region = that.getCoordinate(rs[0].position);
                    that.setState({
                        region: region,
                        position: {
                            latitude: rs[0].position.lat,
                            longitude: rs[0].position.lng
                        },
                        searchAddresses: rs
                    })
                }
            })
    }

    renderAddress() {
        if (this.state.markerAddress)
            return (
                <Text>{'Address: ' + this.state.markerAddress.formattedAddress} </Text>
            )
        else return null;
    }

    render() {
        if (!this.state.isLoading)
            return (
                <View style={styles.contai}>
                    <View style={styles.info}>
                        <Text>{'Lat: ' + this.state.position.latitude}</Text>
                        <Text>{'Lon: ' + this.state.position.longitude}</Text>
                        {this.renderAddress()}
                    </View>
                    <TextInput style={styles.searchInput} placeholder={'Search location'} onSubmitEditing={this.geoAddress} onChange={this.geoAddress} />
                    <MapView
                        style={styles.map}
                        region={this.state.region}
                        onRegionChangeComplete={e => this.setState({ region: e })}
                    >
                        <MapView.Marker
                            draggable
                            coordinate={this.state.position}
                            title={'Current'}
                            description={this.state.markerAddress && this.state.markerAddress.formattedAddress}
                            onDragEnd={this.onDragEnd}

                        />
                    </MapView>
                </View>
            )
        else
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator />
                </View>
            )
    }
}

const styles = StyleSheet.create({
    map: {
        width: width,
        height: height / 1.3,
        //...StyleSheet.absoluteFillObject,
        position: 'absolute',
        bottom: 0
    },
    contai: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center'
    },
    info: {
        alignItems: 'flex-start',
        position: 'absolute',
        top: 0
    },
    searchInput: {
        position: 'absolute',
        top: 60,
        width: 200
    }
})