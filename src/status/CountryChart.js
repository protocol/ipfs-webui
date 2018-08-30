import React, { Component } from 'react'
import { Title } from './Commons'
import { Pie } from 'react-chartjs-2'
import { connect } from 'redux-bundler-react'
import PropTypes from 'prop-types'
import Box from '../components/box/Box'

export class CountryChart extends Component {
  static propTypes = {
    peerLocations: PropTypes.object.isRequired
  }

  render () {
    const { peerLocations } = this.props

    const countryLabels = {}
    const countsByCountry = {}

    Object.keys(peerLocations).forEach(peerId => {
      const { country_code: code, country_name: label } = peerLocations[peerId]
      countsByCountry[code] = (countsByCountry[code] || 0) + 1
      countryLabels[code] = label
    })

    const countryRanking = Object.keys(countsByCountry).sort((a, b) => {
      return countsByCountry[b] - countsByCountry[a]
    })

    const totalCountries = Object.keys(peerLocations).length

    let data

    if (countryRanking.length < 5) {
      data = countryRanking
        .map(code => Math.round((countsByCountry[code] / totalCountries) * 100))
    } else {
      data = countryRanking
        .slice(0, 3)
        .map(code => Math.round((countsByCountry[code] / totalCountries) * 100))

      data = data.concat(100 - data.reduce((total, p) => total + p))
    }

    const datasets = [{
      data,
      backgroundColor: ['#69c4cd', '#f39031', '#ea5037', '#3e9096'],
      label: 'Peer Countries'
    }]

    const options = {
      responsive: true,
      legend: {
        display: true,
        position: 'bottom'
      }
    }

    let labels

    if (countryRanking.length < 5) {
      labels = countryRanking.map(code => countryLabels[code])
    } else {
      labels = countryRanking
        .slice(0, 3)
        .map(code => countryLabels[code])
        .concat('Other')
    }

    return (
      <Box className={this.props.className}>
        <Title>Distribution of peers</Title>
        <Pie data={{ datasets, labels }} options={options} />
      </Box>
    )
  }
}

export default connect('selectPeerLocations', CountryChart)