'use strict';
import React, { PropTypes as T } from 'react';
import mapboxgl from 'mapbox-gl';
import GLDraw from 'mapbox-gl-draw';
import extent from '@turf/bbox';

import { mbStyles } from '../utils/mapbox-styles';

const EditMap = React.createClass({
  displayName: 'EditMap',

  propTypes: {
    mapId: T.string,
    className: T.string,
    geometry: T.object
  },

  map: null,
  drawPlugin: null,

  componentDidMount: function () {
    this.map = new mapboxgl.Map({
      container: this.props.mapId,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [0, 20],
      zoom: 1
    });

    this.addDraw();

    this.map.on('load', () => {
      const prevAOI = this.props.geometry;
      prevAOI.geometry.coordinates[0]
        ? this.loadExistingSource(prevAOI)
        : this.addNewSource();
    });
  },

  componentWillReceiveProps: function (nextProps) {
    const nextAOI = nextProps.geometry;
    if (nextAOI.geometry.coordinates[0]) {
      this.loadExistingSource(nextAOI);
      this.zoomToFeature(nextAOI);
    }
  },

  addDraw: function () {
    this.drawPlugin = new GLDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      styles: mbStyles
    });
    this.map.addControl(this.drawPlugin);
    this.map.on('draw.create', () => this.handleDraw());
    this.map.on('draw.delete', () => this.handleDraw());
    this.startDrawing();
  },

  loadExistingSource: function (prevAOI) {
    prevAOI.id = 'edit-layer';
    this.limitDrawing();
    this.zoomToFeature(prevAOI);
    this.drawPlugin.set({
      'type': 'FeatureCollection',
      'features': [prevAOI]
    });
  },

  addNewSource: function () {
    this.map.addSource('edit-layer', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    this.addLayer();
  },

  addLayer: function () {
    this.map.addLayer({
      'id': 'edit-layer',
      'type': 'fill',
      'source': 'edit-layer',
      'layout': {},
      'filter': [
        'all',
        ['==', '$type', 'Polygon']
      ]
    });
  },

  zoomToFeature: function (feat) {
    this.map.fitBounds(extent(feat), {
      padding: 15,
      // ease-in-out quint
      easing: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t
    });
  },

  startDrawing: function () {
    const drawIconClasses = document.querySelector('.mapbox-gl-draw_polygon').classList;
    drawIconClasses.remove('disabled');
    drawIconClasses.add('active');
  },

  limitDrawing: function () {
    let drawIconClasses = document.querySelector('.mapbox-gl-draw_polygon').classList;
    drawIconClasses.remove('active');
    drawIconClasses.add('disabled');
  },

  handleDraw: function () {
    const edits = this.drawPlugin.getAll();
    const editCount = edits.features.length;

    if (editCount === 0) {
      this.startDrawing();
    } else if (editCount === 1) {
      this.limitDrawing();
      this.passEdits(edits);
    }
  },

  passEdits: function (edits) {
    // Whenever a new feature is added, the map will emit the generated JSON
    // to be received by its parent form element.

    // How to implement the state update in this project?

    console.log(edits);
  },

  render: function () {
    return <div className={this.props.className} id={this.props.mapId}></div>;
  }
});

module.exports = EditMap;
