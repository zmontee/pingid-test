import React, {useState} from 'react';
import {CLAIMS_MAPPING, flatten} from "../../sdk/api.ts";

const InfoTable: React.FC<{ btnLabel: string, data: any }> = ({ btnLabel, data }) => {
    const [show, setShow] = useState(false);

    const hideData = () => setShow(false);
    const showData = () => setShow(true);

    const userData = data? flatten(data) : null;

    return show && userData ? (
        <div>
            <div className="input-field">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Claim</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.keys(data).map(key => (
                        <tr key={key}>
                            <td>{CLAIMS_MAPPING[key]
                                ? CLAIMS_MAPPING[key]
                                : key}</td>
                            <td>{data[key]}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="input-field">
                <button type="button"
                        onClick={hideData}> Hide {btnLabel}
                </button>
            </div>
        </div>
    ) : (
        <div className="input-field">
            <button type="button"
                    onClick={showData}> Show {btnLabel}
            </button>
        </div>
    )
};

export default InfoTable;