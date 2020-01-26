import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const rootElement = document.getElementById('root')
  
class Employee extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employeeData: [],
            maxDaysOnSameProject: [{
                firstEmployeeId: 0,
                secondEmployeeId: 0,
                projectId: 0,
                maxDays: 0
            }]
        };

        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.getCurrentDate = this.getCurrentDate.bind(this);
    }

    setEmployeeDataInState(properties) {
        this.setState({
            employeeData: properties
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
        if(this.state.maxDaysOnSameProject.map((x) => x.maxDays <= differenceInDaysBetweenTwoDates)) {
            const infoForEmployee = {
                firstEmployeeId: firstEmployee.empId,
                secondEmployeeId: secondEmployee.empId,
                projectId: firstEmployee.projectId,
                maxDays: differenceInDaysBetweenTwoDates,
            }

            this.state.maxDaysOnSameProject.push(infoForEmployee);
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
        }

        let largestMaxDays = 0;
        this.state.maxDaysOnSameProject.forEach(element => {
            if(largestMaxDays < element.maxDays) {
                largestMaxDays = element.maxDays;
            }
        });
        
        for (let index = 0; index < this.state.maxDaysOnSameProject.length; index++) {
            if (this.state.maxDaysOnSameProject[index].maxDays < largestMaxDays) {
                this.state.maxDaysOnSameProject.splice(index, 1)
                index = -1;
            }
        }
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
        const maxDaysOnSameProject = this.state.maxDaysOnSameProject;
        return (
            <div>
            <label class="uploadFile">
                <input type="file" onChange={this.handleFileSelect}/>
                 Upload file
            </label>
            {employeeData.length ? (
                <div className="employeeWrapper">
                <table className="border">
                    <thead>
                    <tr className="dataTitle">
                        <th className="employeeTitle">Employee ID #1</th>
                        <th className="employeeTitle">Employee ID #2</th>
                        <th className="employeeTitle">Project ID</th>
                        <th className="employeeTitle">Days worked</th>
                    </tr>
                    </thead>
                    <tbody>
                    {maxDaysOnSameProject.map(employee => (
                    <tr key= {employee.firstEmployeeId + employee.secondEmployeeId + employee.projectId}>
                        <td className="employeeData">{employee.firstEmployeeId}</td>
                        <td className="employeeData">{employee.secondEmployeeId}</td>
                        <td className="employeeData">{employee.projectId}</td>
                        <td className="employeeData">{employee.maxDays}</td>
                    </tr>
                    ))}
                    </tbody>
                </table>

                <table className="border">
                    <thead>
                        <tr className="dataTitle">
                            <th className="employeeTitle">Employee id</th>
                            <th className="employeeTitle">Project id</th>
                            <th className="employeeTitle">Date from</th>
                            <th className="employeeTitle">Date to</th>
                        </tr>
                    </thead>
                    <tbody>
                            {employeeData.map(function(employee) {
                            return <tr key= {employee.empId + employee.projectId}>
                                <td className="employeeData emplId">{employee.empId}</td>
                                <td className="employeeData projectId">{employee.projectId}</td>
                                <td className="employeeData dateFrom">{employee.dateFrom}</td>
                                <td className="employeeData dateTo">{employee.dateTo}</td>
                            </tr>;
                    })}
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
