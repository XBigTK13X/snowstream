import React from 'react'
import { View } from 'react-native';
import SnowText from './snow-text'
import Style from '../snow-style'
import SnowDropdown from './snow-dropdown'
import FillView from './fill-view'

const styles = {
    panel: {
        backgroundColor: Style.color.fade,
        marginTop: -25,
        marginLeft: 15,
        marginRight: 24,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        paddingTop: 30
    }
}

export function SnowTabs(props) {
    if (!props.headers) {
        return null
    }
    if (!props.children) {
        return null
    }
    const tabs = React.Children.toArray(props.children)
    const [tabIndex, setTabIndex] = React.useState(0)
    return (
        <FillView>
            <SnowDropdown
                fade
                options={props.headers}
                onValueChange={setTabIndex}
                valueIndex={tabIndex}
                itemsPerRow={props.headers.length} />
            <FillView style={styles.panel}>
                {tabs[tabIndex]}
            </FillView>
        </FillView>
    )

}

export default SnowTabs