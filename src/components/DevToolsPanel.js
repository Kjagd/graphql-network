import React from 'react';
import Entry from './Entry';
import LongInformation from './LongInformation';

import {
  isGraphQL,
  parseEntry,
} from '../lib/utils';

export default class DevToolsPanel extends React.Component {
  static propTypes = {
    requestFinished: React.PropTypes.object.isRequired,
    getHAR: React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      entryOpen: false,
      openIndex: null,
      filter: '',
    };
  }

  parseLogToState = (log) => {
    if (!isGraphQL(log)) return null;
    return parseEntry(log)
      .then(data => {
        this.setState({
          data: [...this.state.data, ...data],
        });
      });
  };

  requestHandler = (request) => {
    this.parseLogToState(request);
  };

  setEntry = (entry, i) => this.setState({ entryOpen: entry, openIndex: i });
  onRequestClose = () => this.setState({ entryOpen: false, openIndex: null });

  clearEntries = () => {
    this.setState({
      data: [],
      entryOpen: false
    });
  }

  componentDidMount() {
    this.props.requestFinished.addListener(this.requestHandler);
  }

  render() {
    const { data, entryOpen, filter } = this.state;
    const flags = filter == filter.toLowerCase() ? 'i' : ''
    const reg = new RegExp(filter, flags)
    
    const filteredData = data.filter(entry => entry.data.find(request => reg.test(request.name)))
    return (
      <div className="devToolsWrapper">
        <div className={`entryWrapper ${entryOpen && 'shortEntryWrapper'}`}>
        <div className="header">
          <div className="operation">
            <span className="name">Operation Name</span>
            <span className="params">Params</span>
            <span className="fields">Selection</span>
          </div>
          <input className="filterInput" placeholder='filter...' 
            onChange={e => this.setState({ filter: e.target.value })} />
        </div>
        {filteredData.map((entry, i) => {
          return (
            <Entry
              key={`entry-${i}`}
              onClick={() => this.setEntry(entry, i)}
              entry={entry}
              isSelected={entryOpen && entry.id === entryOpen.id}
            />
          );
        })}
        {data.length > 0 &&
          <div className="clearContainer">
            <button onClick={() => this.clearEntries()}>Clear</button>
          </div>
        }
        </div>
        <div className={`displayAreaWrapper ${entryOpen && 'longDisplayAreaWrapper'}`}>
          {entryOpen && (
            <LongInformation
              entry={entryOpen}
              onRequestClose={this.onRequestClose}
            />
          )}
        </div>
      </div>
    );
  }
}
