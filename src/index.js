import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const rootElement = document.getElementById('root')
  
class Employee extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeData: [],
            maxDaysTwoPeopleAreWorkingTogetherOnSameProject: {
                firstEmployeeId: 0,
                secondEmployeeId: 0,
                projectId: 0,
                maxDays: 0
            }
        };

        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.getCurrentDate = this.getCurrentDate.bind(this);
    }

    setEmployeeDataInState(properties) {
        this.setState({
            employeeData: properties
        });
    }

    maxDaysTwoPeopleAreWorkingTogetherOnSameProject(maxDays) {
        this.setState({
            maxDaysTwoPeopleAreWorkingTogetherOnSameProject: maxDays
        });
    }

    getCurrentDate() {
        let today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        today = year + '-' + month + '-' + day;
        return today.toString();
    }

    getAllEmployees(dataFromUploadedFile, allEmployees = []) {
        let that = this;
        dataFromUploadedFile.forEach(function(currentEmployeeData) {
            currentEmployeeData = currentEmployeeData.split(',').map(e => e.trim());
            if (currentEmployeeData[3] === 'NULL') {
                currentEmployeeData[3] = that.getCurrentDate();
            }

            const employeeInfo = {};
            employeeInfo.empId = currentEmployeeData[0];
            employeeInfo.projectId = currentEmployeeData[1];
            employeeInfo.dateFrom = currentEmployeeData[2];

            employeeInfo.dateTo = currentEmployeeData[3];
            allEmployees.push(employeeInfo);
        });

        return allEmployees;
    }

    setStateWithPeopleWhoWorkedMostDays(minDateRange, maxDateRange, firstEmployee, secondEmployee) {
        const differenceBetweenTwoDates = maxDateRange.getTime() - minDateRange.getTime();
        const differenceInDaysBetweenTwoDates = differenceBetweenTwoDates / (1000 * 3600 * 24);

        if (this.state.maxDaysTwoPeopleAreWorkingTogetherOnSameProject.maxDays < differenceInDaysBetweenTwoDates) {
            const infoForEmployee = {
                firstEmployeeId: firstEmployee.empId,
                secondEmployeeId: secondEmployee.empId,
                projectId: firstEmployee.projectId,
                maxDays: differenceInDaysBetweenTwoDates,
            }

            this.maxDaysTwoPeopleAreWorkingTogetherOnSameProject(infoForEmployee);
        }
    }

    getMinAndMaxDateRange(firstEmployee, secondEmployee) {
        const firstEmployeeStartDate = new Date(firstEmployee.dateFrom);
        const firstEmployeeEndDate = new Date(firstEmployee.dateTo);
        const secondEmployeeStartDate = new Date(secondEmployee.dateFrom);
        const secondEmployeeEndDate = new Date(secondEmployee.dateTo);
        let minDateRange = 0;
        let maxDateRange = 0;

        if (secondEmployeeStartDate <= firstEmployeeEndDate && secondEmployeeStartDate >= firstEmployeeStartDate) {
            if (secondEmployeeEndDate > firstEmployeeEndDate) {
                minDateRange = secondEmployeeStartDate;
                maxDateRange = firstEmployeeEndDate;
            } else if (secondEmployeeEndDate <= firstEmployeeEndDate) {
                minDateRange = secondEmployeeStartDate;
                maxDateRange = secondEmployeeEndDate;
            }
        } else if (firstEmployeeStartDate <= secondEmployeeEndDate && firstEmployeeStartDate >= secondEmployeeStartDate) {
            if (firstEmployeeEndDate > secondEmployeeEndDate) {
                minDateRange = firstEmployeeStartDate;
                maxDateRange = secondEmployeeEndDate;
            } else if (firstEmployeeEndDate <= secondEmployeeEndDate) {
                minDateRange = firstEmployeeStartDate;
                maxDateRange = firstEmployeeEndDate;
            }
        }

        if (minDateRange > 0 && maxDateRange > 0) {
            this.setStateWithPeopleWhoWorkedMostDays(minDateRange, maxDateRange, firstEmployee, secondEmployee);
        }
    }

    calculateMaxDays(allEmployees) {
        for (let i = 0; i < allEmployees.length; i++) {
            for (let j = i; j < allEmployees.length; j++) {
                if (allEmployees[i].projectId === allEmployees[j].projectId && allEmployees[i].empId !== allEmployees[j].empId) {
                    this.getMinAndMaxDateRange(allEmployees[i], allEmployees[j])
                }
            };
        };
    }

    handleFileSelect(evt) {
        let files = evt.target.files;
        if (!files.length) {
            alert('Please select file');
            return;
        }

        let file = files[0];
        let that = this;
        let reader = new FileReader();
        reader.onload = function(e) {
            const dataFromUploadedFile = e.target.result.split("\n").map(d => d.trim());
            const allEmployees = that.getAllEmployees(dataFromUploadedFile);
            that.calculateMaxDays(allEmployees);
            that.setEmployeeDataInState(allEmployees);
        };

        reader.readAsText(file);
    }

    render() {
        const employeeData = this.state.employeeData;
        const maxDaysTwoPeopleAreWorkingTogetherOnSameProject = this.state.maxDaysTwoPeopleAreWorkingTogetherOnSameProject;

        return (
            <div>
            <label class="uploadFile">
                <input type="file" onChange={this.handleFileSelect}/>
                 Upload file
            </label>
            {employeeData.length? (
                <div className="employeeWrapper">
                <table className="border">
                    <thead>
                    <tr className="dataTitle">
                        <th className="employeeTitle">First employee id</th>
                        <th className="employeeTitle">Second employee id</th>
                        <th className="employeeTitle">Project id</th>
                        <th className="employeeTitle">Days worked</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td className="employeeData">{maxDaysTwoPeopleAreWorkingTogetherOnSameProject.firstEmployeeId}</td>
                        <td className="employeeData">{maxDaysTwoPeopleAreWorkingTogetherOnSameProject.secondEmployeeId}</td>
                        <td className="employeeData">{maxDaysTwoPeopleAreWorkingTogetherOnSameProject.projectId}</td>
                        <td className="employeeData">{maxDaysTwoPeopleAreWorkingTogetherOnSameProject.maxDays}</td>
                    </tr>
                    </tbody>
                </table>
            </div>) :null}
            </div>
        );
    }
    }

    function App() {
    return(
    <div>
        <Employee/>
    </div>
    )
    }

    ReactDOM.render(
    <App />,
    rootElement
    )
