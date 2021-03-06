import React, { Component } from 'react';
import { Feedback, Card, Select, Checkbox } from '@icedesign/base';
import Container from '@icedesign/container';
import { Input, Button, Tab, Grid, Tree, Dialog, Collapse, Message, Icon, Balloon, Shell } from '@alifd/next';
import * as oexchain from 'oex-web3';
import * as solanaWeb3 from '@solana/web3.js';
import * as ethers from 'ethers';
import * as ethUtil from 'ethereumjs-util';
import * as abiUtil from 'ethereumjs-abi';
import cookie from 'react-cookies';
import BigNumber from 'bignumber.js';
import { encode } from 'rlp';
import ReactJson from 'react-json-view';
import copy from 'copy-to-clipboard';
import IceEllipsis from '@icedesign/ellipsis';

import * as utils from '../../utils/utils';
import * as keystore from '../../utils/keystore';
import * as txParser from '../../utils/transactionParser';
import * as sha256 from '../../utils/sha256';
import * as Notification from '../../utils/notification';
import eventProxy from '../../utils/eventProxy';
import { T } from '../../utils/lang';
import TxSend from "../TxSend";
import * as Constant from '../../utils/constant';
import ContractEditor from './components/Editor';
import './ContractDev.scss';
import * as CompilerSrv from './CompilerSrv';

const { Row, Col } = Grid;
const TreeNode = Tree.Node;
const Panel = Collapse.Panel;
const extraHeight = 200 + 30 + 30;  // Log + Head + TabNav

const Transfer = ({self, contractName, funcName}) => {
  return <div>
    <Checkbox key='transferCheck'
      onChange={checked => {
        let transferTogether = utils.deepClone(self.state.transferTogether);
        transferTogether[contractName + funcName] = checked;
        let visibilityValue = utils.deepClone(self.state.visibilityValue);
        visibilityValue[contractName + funcName] = checked ? 'block' : 'none';
        // self.state.visibilityValue[funcName] = checked ? 'block' : 'none';
        self.setState({ transferTogether, visibilityValue, txSendVisible: false });
        // var obj = document.getElementById(contractName + funcName + 'Container');
        // obj.style.display= visibilityValue[contractName + funcName];
      }}>{T('????????????')}
    </Checkbox>
    <br />
    <br />
    <Container key='transferContainer' id={contractName + funcName + 'Container'} style={{display: self.state.visibilityValue[contractName + funcName], height:'50'}}>
      <Input hasClear
        onChange={self.handleParaValueChange.bind(self, contractName, funcName, 'transferAssetId')}
        style={{ ...styles.inputBoder, width: 600 }}
        innerBefore={T('????????????ID')}
        size="medium"
        placeholder="??????????????????????????????????????????????????????????????????????????????0,1,10"
      />
      <br />
      <br />
      <Input hasClear
        onChange={self.handleParaValueChange.bind(self, contractName, funcName, 'transferAssetValue')}
        style={{ ...styles.inputBoder, width: 600 }}
        innerBefore={T('??????????????????')}
        size="medium"
        placeholder="??????????????????????????????????????????????????????ID????????????????????????100,10,1"
      />
    </Container>
  </div>
}

const TxReceiptResult = ({self, contractName, funcName}) => {
  return <div>
    <Button key='getTxInfo' type="primary" onClick={self.getTxInfo.bind(self, contractName, funcName)} style={{marginRight: '20px'}}>{T('????????????')}</Button>
    <Button key='getReceiptInfo' type="primary" onClick={self.getReceiptInfo.bind(self, contractName, funcName)}>{T('??????Receipt')}</Button>
    <br /><br />
    {/* <Input  key='txReceiptResult' id={contractName + funcName + 'TxReceipt'} 
      value={self.state.result[contractName + funcName + 'TxReceipt']}
      multiple
      rows="5"
      style={{ width: 600 }}
      addonBefore={T("??????/Receipt??????:")}
      size="medium"
    /> */}
    {T('????????????:')}<br />
    <ReactJson key='txInfoResult' id={contractName + funcName + 'TxInfo'} displayDataTypes={false} style={{backgroundColor: '#fff'}}
      src={utils.isEmptyObj(self.state.result[contractName + funcName + 'TxInfo']) ? {} : JSON.parse(self.state.result[contractName + funcName + 'TxInfo'])}
    />
    <br /> {T('Receipt??????:')}<br />
    <ReactJson key='receiptInfoResult' id={contractName + funcName + 'ReceiptInfo'} displayDataTypes={false} style={{backgroundColor: '#fff'}}
      src={utils.isEmptyObj(self.state.result[contractName + funcName + 'ReceiptInfo']) ? {} : JSON.parse(self.state.result[contractName + funcName + 'ReceiptInfo'])}
    />
  </div>
}

const Parameters = ({self, contractName, funcName, parameterNames, parameterTypes, width}) => {
  return parameterNames.map((paraName, index) => (
    <div>
      <Input key={paraName} hasClear
        onChange={self.handleParaValueChange.bind(self, contractName, funcName, paraName)}
        style={{ ...styles.inputBoder, width }}
        innerBefore={paraName}
        size="medium"
        placeholder={parameterTypes[index]}
        />
      <br /><br />
    </div>
  ))
}

const OneFunc = ({self, contractAccountName, contractName, funcName, parameterTypes, parameterNames}) => {
  let callBtnName = T('????????????');
  if (!self.state.funcParaConstant[contractName][funcName]) {
    callBtnName = T('??????????????????');
    const transferTogether = self.state.transferTogether[contractName + funcName];
    self.state.visibilityValue[contractName + funcName] = (transferTogether != null && transferTogether) ? 'block' : 'none';
  }
  return <Card style={{ width: 800, marginBottom: "20px" }} bodyHeight="auto" title={funcName}>
          <Parameters self={self} contractName={contractName} funcName={funcName} width='600px'
            parameterNames={parameterNames} parameterTypes={parameterTypes} />
          {
            self.state.funcPayable[contractName][funcName] ? 
              <Transfer self={self} contractName={contractName} funcName={funcName} /> : ''
          }
          <Button type="primary" onClick={self.callContractFunc.bind(self, contractAccountName, contractName, funcName)}>{callBtnName}</Button>
          <br />
          <br />
          <Input readOnly style={{ ...styles.inputBoder, width: 600 }} 
            value={self.state.result[contractName + funcName]}
            innerBefore={T('??????')} size="medium"/>
          <br />
          <br />
          {
            !self.state.funcParaConstant[contractName][funcName] ? 
              <TxReceiptResult self={self} contractName={contractName} funcName={funcName} /> : ''
          }
         </Card>;
}

const DisplayOneTypeFuncs = ({self, contract, abiInfos}) => {
  const {contractAccountName, contractName} = contract;

  return (<Collapse rtl='ltr'>
          {abiInfos.map((interfaceInfo, index) => {
            if (interfaceInfo.type === 'function') {
              const funcName = interfaceInfo.name;
              const parameterTypes = [];
              const parameterNames = [];
              for (const input of interfaceInfo.inputs) {
                parameterTypes.push(input.type);
                parameterNames.push(input.name);
              }

              self.state.funcParaTypes[contractName][funcName] = parameterTypes;
              self.state.funcParaNames[contractName][funcName] = parameterNames;
              self.state.funcResultOutputs[contractName][funcName] = interfaceInfo.outputs;
              self.state.funcParaConstant[contractName][funcName] = interfaceInfo.constant;
              self.state.funcPayable[contractName][funcName] = interfaceInfo.payable;
              return <Panel key={index}  title={funcName}>
                      <OneFunc key={contractAccountName + contractName + funcName} self={self} 
                        contractAccountName={contractAccountName} contractName={contractName} 
                        funcName={funcName} parameterTypes={parameterTypes} parameterNames={parameterNames}/>
                    </Panel>;      
            }
          })}
        </Collapse>);
}

const ContractArea = ({ self, contract }) => {
  const {contractAccountName, contractName} = contract;
  self.state.funcParaTypes[contractName] = {};
  self.state.funcParaNames[contractName] = {};
  self.state.funcParaConstant[contractName] = {};
  self.state.funcResultOutputs[contractName] = {};
  self.state.funcPayable[contractName] = {};

  const readonlyFuncs = [];
  const writableFuncs = [];
  const writablePayableFuncs = [];
  contract.contractAbi.map((interfaceInfo, index) => {
    if (interfaceInfo.type === 'function') {
      if (interfaceInfo.constant) {
        readonlyFuncs.push(interfaceInfo);
      } else if (interfaceInfo.payable) {
        writablePayableFuncs.push(interfaceInfo);
      } else {
        writableFuncs.push(interfaceInfo);
      }
    }
  }
  );
  return <Shell  style={{ width: '100%', minHeight: window.innerHeight - extraHeight }}>
          <Shell.Content>
            {T('???????????????:')}<br/>
            <DisplayOneTypeFuncs self={self} abiInfos={readonlyFuncs} contract={contract}/>
            <br/>{T('???????????????:')}<br/>
            <DisplayOneTypeFuncs self={self} abiInfos={writableFuncs} contract={contract}/>
            <br/>{T('???????????????????????????:')}<br/>
            <DisplayOneTypeFuncs self={self} abiInfos={writablePayableFuncs} contract={contract}/>
          </Shell.Content>
        </Shell>
      
} 

const ContractCollapse = ({self, contractAccountInfo}) => {
  global.localStorage.setItem('contractAccountInfo', JSON.stringify(contractAccountInfo));
  return <Collapse rtl='ltr'>
            {contractAccountInfo.map((contract, index) => (
              <Panel key={index}  
                title={T("??????:") + (index + 1) + '???' + T('????????????:') + contract.contractAccountName 
                       + '???' + T('?????????:') + contract.contractName + '???' + T('????????????:') + (contract.createDate == null ? T('?????????') : contract.createDate)}>
                <ContractArea self={self} contract={contract}/>
              </Panel>
            ))}
         </Collapse>
}

function CustomTabItem({ title, closeFunc }) {
  return (<Row justify='center' style={{color: '#fff'}}>
              {title}
              <Button text onClick={() => closeFunc(title)}><Icon size='xs' type='error'/></Button>
          </Row>);
}

export default class ContractManager extends Component {
  static displayName = 'ContractManager';

  constructor(props) {
    super(props);
    let abiInfoStr = '';
    const abiInfo = global.localStorage.getItem('abiInfo');
    if (abiInfo != null) {
      abiInfoStr = JSON.stringify(abiInfo).replace(/\\"/g, '"');
      abiInfoStr = abiInfoStr.substring(1, abiInfoStr.length - 1);
    }
    const abiContractName = cookie.load('abiContractName');
    this.state = {
      accountReg: new RegExp('^([a-z][a-z0-9]{6,15})(?:\.([a-z0-9]{2,16})){0,1}(?:\.([a-z0-9]{2,16})){0,1}$'),
      passwordReg: new RegExp('^([a-zA-Z0-9]{8,20})$'),
      accounts: [],
      accountsOfShareCode: [],
      contractFuncInfo: [],
      abiInfos: [],
      contractAccountInfo: [],
      contractAccountMap: {},
      accountContractInfoMap: {},
      contractAccountCreateTime: {},
      abiInfo: abiInfoStr,
      paraValue: {},
      funcParaTypes: {},
      funcParaNames: {},
      funcParaConstant: {},
      funcPayable: {},
      funcResultOutputs: {},      
      constructorParaNames: [],
      constructorParaTypes: [],
      result: {},
      txInfo: {},
      txSendVisible: false,
      defaultAccountName: '',
      contractName: abiContractName,
      contractAccount: abiContractName,
      selectedAccount: null,
      selectedAccountName: '',
      transferTogether: {},
      visibilityValue: {},
      curContractName: '',
      curCallFuncName: '',
      curTxResult: {},
      resultDetailInfo: '',
      solFileList: ['sample.rs'],
      tabFileList: ['sample.rs'],
      libFileList: [],
      smapleFileList: [],
      fileContractMap: {},
      contractList: [],
      contractAccountAbiMap: {},
      activeKey: '',
      addNewContractFileVisible: false,
      deployContractVisible: false,
      compileSrvSettingVisible: false,
      contractInfoVisible: false,
      displayAbiVisible: false,
      displayBinVisible: false,
      constructorVisible: false,
      curAbi: null,
      curBin: null,
      loadedContractAccount: '',
      compileSrv: '',
      selectContactFile: '',
      selectedFileToCompile: null,
      selectedContractToDeploy: null,
      resultInfo: '',
      newContractAccountName: '',
      keystoreInfo: {},
      suggestionPrice: 1,
      gasLimit: 10000000,
      ftAmount: 2,      
      createAccountVisible: false,
      shareCodeContract: {},
      chainConfig: null,
      collapse: false,
      width: '250px',
     };
     const solFileList = global.localStorage.getItem('solFileList');
     if (solFileList != null) {
       this.state.solFileList = solFileList.split(',').filter(fileName => fileName != null && fileName != '');
       if (this.state.solFileList.length > 0) {
        this.state.tabFileList = [this.state.solFileList[0]];
        this.state.activeKey = this.state.tabFileList[0];
       } else {
        this.state.tabFileList = [];
        this.state.activeKey = '';
       }
     }

     const contractAccountInfo = global.localStorage.getItem('contractAccountInfo');
     if (contractAccountInfo != null) {
      this.state.contractAccountInfo = JSON.parse(contractAccountInfo);
      this.state.contractAccountInfo.map(contractAccountInfo => {
        if (this.state.contractAccountMap[contractAccountInfo.solFileName + ':' + contractAccountInfo.contractName] == null) {
          this.state.contractAccountMap[contractAccountInfo.solFileName + ':' + contractAccountInfo.contractName] = contractAccountInfo.contractAccountName;
          this.state.accountContractInfoMap[contractAccountInfo.contractAccountName] = contractAccountInfo;
        }
      });
     }
     

     const contractList = global.localStorage.getItem('contractList');
     if (contractList != null) {
      this.state.contractList = JSON.parse(contractList);
     }

     const fileContractMap = global.localStorage.getItem('fileContractMap');
     if (fileContractMap != null) {
       this.state.fileContractMap = JSON.parse(fileContractMap);
     }
  }

  componentDidMount = async () => {
    this.state.chainConfig = await oexchain.oex.getChainConfig();
    oexchain.oex.setChainId(this.state.chainConfig.chainId);

    const keystore = utils.getDataFromFile(Constant.KeyStore);
    const keystoreList = keystore == null ? null : [keystore];
    if (keystoreList != null) {
      for (const keystore of keystoreList) {
        this.state.keystoreInfo[keystore.publicKey] = keystore;
      }
    }    
    oexchain.oex.getChainConfig().then(chainConfig => {
      this.state.selectedAccount = utils.getDataFromFile(Constant.AccountObj);
      const accounts = [this.state.selectedAccount];
      for (let account of accounts) {
        for (let author of account.authors) {
          if (this.state.keystoreInfo[author.owner] != null) {
            this.state.accounts.push({value: account.accountName, label: account.accountName, object: account});
            break;
          }
        }
      }
      const accountObj = this.state.selectedAccount;
      // let canceled = cookie.load('createFirstAccount');
      if (accountObj != null) {
        this.setState({ selectedAccountName: accountObj.accountName, 
                        selectedAccount: accountObj,
                        txSendVisible: false });
      } else {
        this.state.selectedAccountName = utils.guid();
        const chainId = oexchain.oex.getChainId();
        let netType = '??????';
        if (chainId == 1) {
          netType = '??????';
        } else if (chainId == 100) {
          netType = '?????????';
        }
        Dialog.confirm({
          title: '??????' + netType + '??????',
          content: '???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
          messageProps:{
              type: 'warning'
          },
          okProps: {children: '????????????', className: 'unknown'},
          onOk: () => {eventProxy.trigger('importAccountInfo');},
          onCancel: () => {}
        });
      }
    });
    this.syncSolFileToSrv();
    
    const libFiles = await CompilerSrv.getLibSolFile();
    for(var fileName in libFiles) {
      this.state.libFileList.push(fileName);
      global.localStorage.setItem('sol:' + fileName, libFiles[fileName]);
    }
    
    const sampleFiles = await CompilerSrv.getSampleSolFile();
    for(var fileName in sampleFiles) {
      this.state.smapleFileList.push(fileName);
      global.localStorage.setItem('sol:' + fileName, sampleFiles[fileName]);
    }

    const abiInfo = global.localStorage.getItem('abiInfo');
    if (abiInfo != null) {
      let abiInfoStr = JSON.stringify(abiInfo).replace(/\\"/g, '"');
      abiInfoStr = abiInfoStr.substring(1, abiInfoStr.length - 1);
      this.setState({ storedAbiInfo: abiInfoStr, txSendVisible: false });
    }

    oexchain.oex.getSuggestionGasPrice().then(suggestionPrice => {
      this.setState({ gasPrice: utils.getReadableNumber(suggestionPrice, 9, 9), txSendVisible: false });
    })
  }

  initContract = () => {
    Constant.ShareCoding.map((interfaceInfo, index) => {
      if (interfaceInfo.type === 'function') {
        
      }
    }
    );
  }

  parseConstructorInputs = (contractAbi) => {
    this.state.constructorParaNames = [];
    this.state.constructorParaTypes = [];
    for (let interfaceInfo of contractAbi) {
      if (interfaceInfo.type == 'constructor') {
        for (let input of interfaceInfo.inputs) {
          this.state.constructorParaNames.push(input.name);
          this.state.constructorParaTypes.push(input.type);
        }
        return;
      }
    }
  }

  syncSolFileToSrv = () => {
    CompilerSrv.setChainId(oexchain.oex.getChainId());
    for (const solFile of this.state.solFileList) {
     const solCode = global.localStorage.getItem('sol:' + solFile);
     CompilerSrv.updateSol(this.state.selectedAccountName, solFile, solCode);
    }
  }

  getAccountPublicKey = () => {
    for (let author of this.state.selectedAccount.authors) {
      if (this.state.keystoreInfo[author.owner] != null) {
        return author.owner;
      }
    }
    return '';
  }

  handleContractAccountChange = (value) => {
    this.state.contractAccount = value;
  }

  saveContractName = (value) => {
    this.state.contractName = value.currentTarget.defaultValue;
    cookie.save('abiContractName', this.state.contractName);
  }

  handleABIInfoChange = (value) => {
    this.setState({ abiInfo: value, txSendVisible: false });
  }

  checkABI = (abiInfo) => {
    if (utils.isEmptyObj(abiInfo) 
    || (!utils.isEmptyObj(abiInfo) && !oexchain.utils.isValidABI(abiInfo))) {
      Feedback.toast.error(T('ABI????????????????????????????????????????????????'));
      return false;
    }
    return true;
  }

  handleParaValueChange = (contractName, funcName, paraName, value) => {
    this.state.paraValue[contractName + '-' + funcName + '-' + paraName] = value;
  }

  onChangeAccount = (accountName, item) => {
    this.state.selectedAccountName = accountName;
    this.state.selectedAccount = item.object;
    this.setState({ selectedAccountName: accountName, selectedAccount: item.object, txSendVisible: false });
    this.syncSolFileToSrv();
  }

  selectShareCodeAccount = () => {

  }

  syncContracts = () => {

  }

  giveReward = () => {

  }


  handleContractNoChange = (v) => {
    this.state.contractIndex = v;
  }

  changeLog = (v) => {
    this.state.resultInfo = v;
    this.setState({resultInfo: this.state.resultInfo});
  }

  removeContractCall = () => {
    if (utils.isEmptyObj(this.state.contractIndex)) {
      Feedback.toast.error(T('???????????????????????????????????????'));
      return;
    }
    const index = parseInt(this.state.contractIndex);
    if (index > this.state.contractAccountInfo.length || index < 1) {
      Feedback.toast.error('????????????????????????0???????????????' + this.state.contractAccountInfo.length);
      return;
    }
    this.state.contractAccountInfo.splice(index - 1, 1);
    this.setState({contractAccountInfo: this.state.contractAccountInfo, txSendVisible: false});
  }

  onChangeContractFile = (fileToCompile) => {
    this.setState({ selectedFileToCompile: fileToCompile, txSendVisible: false });
  }

  onChangeContract = (contractToDeploy) => {
    const contractInfo = contractToDeploy.split(':');      
    const contractCode = this.state.fileContractMap[contractInfo[0]][contractInfo[1]];
    const oneContractABI = JSON.parse(contractCode.abi);
    if (oneContractABI != null) {
      this.parseConstructorInputs(oneContractABI);
    }

    this.setState({ selectedContractToDeploy: contractToDeploy, txSendVisible: false });
  }

  handleLoadedContractAccountChange = (v) => {
    this.setState({ loadedContractAccount: v, txSendVisible: false });
  }

  loadContract = () => {
    if (utils.isEmptyObj(this.state.loadedContractAccount)) {
      Feedback.toast.error(T('?????????????????????'));
      return;
    }
    oexchain.account.getAccountByName(this.state.loadedContractAccount).then(async (account) => {
      if (account == null) {
        Feedback.toast.error(T('??????????????????'));
        return;
      }
      if (account.codeSize == 0) {
        Feedback.toast.error(T('???????????????????????????????????????'));
        return;
      }
      const contractAbi = utils.getContractABI(this.state.loadedContractAccount);
      if (!utils.isEmptyObj(contractAbi)) {
        const contractName = this.getContractName(this.state.loadedContractAccount);
        this.displayContractFunc(this.state.loadedContractAccount, 
                                 'tmpFile-' + utils.getRandomInt(10000),
                                 utils.isEmptyObj(contractName) ? 'tmpName-' + utils.getRandomInt(10000) : contractName , 
                                 contractAbi);
        return;
      } else {
        const bURC20 = await utils.checkURC20(this.state.loadedContractAccount);
        if (bURC20) {
          this.displayContractFunc(this.state.loadedContractAccount, 
                                   'tmpFile-' + utils.getRandomInt(10000),
                                   'URC20-' + utils.getRandomInt(10000), Constant.URC20ABI);
          return;
        }
      }
      this.setState({ contractInfoVisible: true, txSendVisible: false });
    });
  }
  addLog = (logInfo) => {
    let date = new Date().toLocaleString();
    logInfo = date + ':' + logInfo + '\n\n';
    this.setState({resultInfo: this.state.resultInfo + logInfo, txSendVisible: false});
  }

  copyAccount = () => {
    if (utils.isEmptyObj(this.state.selectedAccountName) || this.state.selectedAccountName.indexOf('-') > 0) {
      Feedback.toast.error(T('??????????????????'));
      return;
    }
    copy(this.state.selectedAccountName);
    Feedback.toast.success(T('???????????????????????????'));
  }

  shareCode = () => {
    Dialog.confirm({
      title: '????????????????????????',
      content: '????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????',
      messageProps:{
          type: 'success'
      },
      okProps: {children: '????????????', className: 'unknown'},
      onOk: () => {this.shareCodeTx();},
      onCancel: () => { }
    });
  }

  shareCodeTx = () => {

  }

  createAccount = () => {

  }

  compileContract = async () => {
    this.state.selectedFileToCompile = this.state.selectContactFile;
    if (this.state.selectedFileToCompile == null || this.state.selectedFileToCompile.length == 0) {
      Feedback.toast.error(T('???????????????????????????'));
      return;
    }
    this.addLog(T("???????????????????????????") + this.state.selectedFileToCompile);
    const compileResult = await CompilerSrv.compileSol(this.state.selectedAccountName, this.state.selectedFileToCompile);
    if (compileResult.err != null) {
      Feedback.toast.error(T("????????????"));
      this.addLog(compileResult.err);
      return;
    }
    Feedback.toast.success(T("????????????"));
    this.addLog(T("????????????"));

    this.state.fileContractMap[this.state.selectedFileToCompile] = compileResult;
    this.state.contractList = [];
    for (var contractFile in this.state.fileContractMap) {
      const compiledInfo = this.state.fileContractMap[contractFile];
      for (var contractName in compiledInfo) {
        this.state.contractList.push(contractFile + ":" + contractName);
        // if (contractFile == this.state.selectedFileToCompile)
        //   this.addLog(T("?????? ") + contractName + T(" ????????????") + '\n' + compiledInfo[contractName].abi);
      }
    }
    global.localStorage.setItem("contractList", JSON.stringify(this.state.contractList));
    global.localStorage.setItem("fileContractMap", JSON.stringify(this.state.fileContractMap));
    if (this.state.selectedContractToDeploy != null 
      && this.state.selectedContractToDeploy.indexOf(this.state.selectedFileToCompile) > -1) {
        this.state.selectedContractToDeploy = "";
        this.state.constructorParaNames = [];
        this.state.constructorParaTypes = [];
    }
    this.setState({contractList: this.state.contractList, selectedContractToDeploy: this.state.selectedContractToDeploy, txSendVisible: false});
  }
  setCompileSrv = () => {
    this.setState({compileSrvSettingVisible: true, txSendVisible: false});
  }
  // ????????????????????????
  // 1:??????????????????????????????(????????????), ??????(???????????????)??????OEX??????(??????????????????)
  // 2:?????????bytecode????????????????????????????????????
  deployContract = async () => {
    this.state.selectedContractToDeploy = this.state.selectContactFile;
    if (this.state.selectedContractToDeploy == null || !this.state.selectedContractToDeploy.endsWith('.bin')) {
      Feedback.toast.error(T('??????????????????????????????bin??????'));
      return;
    }
    this.state.selectedContractToDeploy = this.state.selectedContractToDeploy.substr(0, this.state.selectedContractToDeploy.length - 4);
    this.state.newContractAccountName = await this.generateContractAccount();
    this.state.newContractPublicKey = this.getAccountPublicKey();
    if (this.state.constructorParaNames.length > 0) {
      this.setState({constructorVisible: true});
    } else {
      this.setState({deployContractVisible: true, txSendVisible: false});
    }
  }

  onConstructOK = () => {
    this.setState({deployContractVisible: true, constructorVisible: false, txSendVisible: false});
  }

  displayAbi = () => {
    if (this.state.selectedContractToDeploy == null) {
      Feedback.toast.error(T('???????????????'));
      return;
    }
    const contractInfo = this.state.selectedContractToDeploy.split(':');      
    const contractCode = this.state.fileContractMap[contractInfo[0]][contractInfo[1]];
    if (contractCode == null) {
      Feedback.toast.error(T('????????????????????????'));
      return;
    }
    this.setState({curAbi: JSON.parse(contractCode.abi), displayAbiVisible: true, txSendVisible: false});
  }
  displayBin = () => {
    if (this.state.selectedContractToDeploy == null) {
      Feedback.toast.error(T('???????????????'));
      return;
    }
    const contractInfo = this.state.selectedContractToDeploy.split(':');      
    const contractCode = this.state.fileContractMap[contractInfo[0]][contractInfo[1]];
    if (contractCode == null) {
      Feedback.toast.error(T('????????????????????????'));
      return;
    }
    this.setState({curBin: contractCode.bin, displayBinVisible: true, txSendVisible: false});
  }
  generateContractAccount = async () => {
    const nonce = await oexchain.account.getNonce(this.state.selectedAccountName);
    const shaResult = sha256.hex_sha256(this.state.selectedAccountName + nonce).substr(2);
    if (shaResult.charAt(0) > 'a' && shaResult.charAt(0) < 'z') {
      return shaResult.substr(0, 12);
    } else {
      return 'x' + shaResult.substr(0, 11);
    }
  }

  callContractFunc = async (contractAccountName, contractName, funcName) => {
    try {      
      if (utils.isEmptyObj(this.state.selectedAccountName)) {
        Feedback.toast.error(T('????????????????????????????????????'));
        return;
      }

      if (utils.isEmptyObj(contractAccountName)) {
        Feedback.toast.error(T('????????????????????????'));
        return;
      }
      const contractAccount = await oexchain.account.getAccountByName(contractAccountName);
      if (contractAccount == null) {
        Feedback.toast.error(T('???????????????'));
        return;
      }
      const paraNames = this.state.funcParaNames[contractName][funcName];
      const values = [];
      let index = 0;
      for (const paraName of paraNames) {
        const value = this.state.paraValue[contractName + '-' + funcName + '-' + paraName];
        if (value == null) {
          Feedback.toast.error(T('??????') + paraName + T('???????????????'));
          return;
        }
        const type = this.state.funcParaTypes[contractName][funcName][index];
        if (type == 'bool') {
          value = (value == 'false' || value == 0) ? false : true;
          values.push(value);
        } else if (type.lastIndexOf(']') === type.length - 1) {
          if (value.indexOf('[') != 0 || value.lastIndexOf(']') != value.length - 1) {
            Feedback.toast.error('?????????????????????????????????????????????[a,b,c]');
            return;
          }          
          values.push(value.substr(1, value.length - 2).split(','));
        } else {
          values.push(value);
        }
        index++;
      }
      const self = this;
      const assetAmountMap = {};
      assetAmountMap[this.state.chainConfig.SysTokenId] = '0';
      let payload = '0x' + oexchain.utils.getContractPayload(funcName, this.state.funcParaTypes[contractName][funcName], values);
      if (this.state.funcParaConstant[contractName][funcName]) {
        const callInfo = {actionType:0, from: this.state.selectedAccountName, to: contractAccountName, assetId:0, gas:200000000, gasPrice:10000000000, value:0, data:payload, remark:''};
        oexchain.oex.call(callInfo, 'latest').then(resp => {
          const ret = (resp == '0x') ? '0x' : utils.parseResult(self.state.funcResultOutputs[contractName][funcName], resp);
          this.addLog("????????????" + funcName + "??????????????????" + JSON.stringify(ret));
          self.state.result[contractName + funcName] = JSON.stringify(ret);
          self.setState({ result: self.state.result, txSendVisible: false });
        });
      } else {
        let assetIds = [];
        let amounts = [];        
        if (this.state.transferTogether[contractName + funcName]) {   // ??????????????????
          var assetIdsInfo = this.state.paraValue[contractName + '-' + funcName + '-transferAssetId'];
          var amountsInfo = this.state.paraValue[contractName + '-' + funcName + '-transferAssetValue'];      
          if (utils.isEmptyObj(assetIdsInfo) || utils.isEmptyObj(amountsInfo)) {
            Feedback.toast.error(T('????????????????????????????????????????????????'));
            return;
          }
          assetIdsInfo = assetIdsInfo.trim().split(',');
          amountsInfo = amountsInfo.trim().split(',');
          for (let i = 0; i < assetIdsInfo.length; i++) {
            var assetId = assetIdsInfo[i].trim();
            var amount = amountsInfo[i].trim();
            if (utils.isEmptyObj(assetId) || utils.isEmptyObj(amount)) {
              Feedback.toast.error(T('??????ID???????????????????????????????????????????????????'));
              return;
            }
            assetId = parseInt(assetId);
            amount = parseInt(amount);
            if (assetAmountMap[assetId] != null) {
              Feedback.toast.error(T('?????????????????????????????????????????????'));
              return;
            }
            assetAmountMap[assetId] = amount;
            assetIds.push(assetId);
            amounts.push(amount);
          }
        }

        let oexAmount = assetAmountMap[this.state.chainConfig.SysTokenId];
        if (!utils.isEmptyObj(oexAmount)) {
          oexAmount = parseInt(oexAmount);
        }

        // ??????????????????????????????????????????????????????????????????action???
        // ????????????????????????????????????????????????oex????????????????????????payload??????action????????????id??????????????????0
        let actionAssetId = 0;
        let actionAmount = 0;
        if (assetIds.length == 0) {
          this.state.txInfo = { actionType: Constant.CALL_CONTRACT,
            toAccountName: contractAccountName,
            assetId: actionAssetId,
            amount: actionAmount,
            payload };
        } else if (assetIds.length == 1) {   // ???????????????
          actionAssetId = assetIds[0];
          const assetInfo = await oexchain.account.getAssetInfoById(actionAssetId);
          if (assetInfo == null) {
            Feedback.toast.error(T('???????????????ID??????????????????????????????'));
            return;
          }
          actionAmount = new BigNumber(amounts[0]).shiftedBy(assetInfo.decimals).toString(16);

          this.state.txInfo = { actionType: Constant.CALL_CONTRACT,
            toAccountName: contractAccountName,
            assetId: actionAssetId,
            amount: '0x' + actionAmount,
            payload };
            
        } else {   // ????????????
            const extraAssetInfo = [];
            for (var i = 0; i < assetIds.length; i++) {
              const assetInfo = await oexchain.account.getAssetInfoById(assetIds[i]);
              if (assetInfo == null) {
                Feedback.toast.error(T('???????????????ID??????????????????????????????'));
                return;
              }
              amount = '0x' + new BigNumber(amounts[i]).shiftedBy(assetInfo.decimals).toString(16);
              extraAssetInfo.push([assetIds[i], amount]);
            }
            
            payload = '0x' + encode([[...extraAssetInfo], payload]).toString('hex');

            this.state.txInfo = { actionType: Constant.MULTI_ASSET_CALL,
              toAccountName: contractAccountName,
              assetId: 0,
              amount: 0,
              payload };
        }
        
        this.setState({ txSendVisible: true, curContractName: contractName, curCallFuncName: funcName });
      }
    } catch (error) {
      this.addLog('??????????????????:' + error);
      Feedback.toast.error('?????????????????????' + error);
    }
  }

  getTxInfo = (contractName, funcName) => {
    const txHash = this.state.curTxResult[contractName][funcName];
    if (txHash != null) {
      if (txHash.indexOf('0x') != 0) {
        Feedback.toast.error(T('?????????hash???????????????'));
        return;
      }
      oexchain.oex.getTransactionByHash(txHash).then(txInfo => {        
        this.addLog("????????????\n" + JSON.stringify(txInfo));
        this.state.result[contractName + funcName + 'TxInfo'] = JSON.stringify(txInfo);
        this.setState({result: this.state.result, txSendVisible: false});
      });
    }
  }

  getReceiptInfo = (contractName, funcName) => {
    const txHash = this.state.curTxResult[contractName][funcName];
    if (txHash != null) {
      if (txHash.indexOf('0x') != 0) {
        Feedback.toast.error(T('?????????hash???????????????'));
        return;
      }
      oexchain.oex.getTransactionReceipt(txHash).then(receipt => {        
        if (receipt == null) {
          Feedback.toast.error(T('receipt????????????'));
          return;
        }
        this.addLog("receipt\n" + JSON.stringify(receipt));
        this.state.result[contractName + funcName + 'ReceiptInfo'] = JSON.stringify(receipt);
        this.setState({result: this.state.result, txSendVisible: false});
        const actionResults = receipt.actionResults;
        if (actionResults[0].status == 0) {
          Feedback.toast.error(T('Receipt???????????????????????????????????????') + ':' + actionResults[0].error);
        } else {
          Feedback.toast.success(T('Receipt??????????????????????????????'));
        }
      });
    }
  }

  getTxResult = (result) => {
    this.addLog("????????????" + this.state.curCallFuncName + "???????????????:" + result);
    this.state.result[this.state.curContractName + this.state.curCallFuncName] = result;
    this.setState({result: this.state.result, txSendVisible: false});
    this.state.curTxResult[this.state.curContractName] = {};
    this.state.curTxResult[this.state.curContractName][this.state.curCallFuncName] = result;
  }

  selectTab = (key) => {
    this.setState({activeKey: key, txSendVisible: false});
  }

  addSolTab = (fileName) => {
    if (fileName == null) {
      return;
    }
    let exist = false;
    this.state.tabFileList.map(tabFileName => {
      if (fileName == tabFileName) {
        exist = true;
      }
    });
    if (exist) {
      this.setState({activeKey: fileName, txSendVisible: false});
    } else {
      this.state.tabFileList.push(fileName);
      this.setState({activeKey: fileName, tabFileList: this.state.tabFileList, txSendVisible: false});
    }
  }

  delSolTab = (fileName) => {
    let index = this.state.tabFileList.indexOf(fileName);
    if (index > -1) {
      this.state.tabFileList.splice(index, 1);
    }
    if (index >= this.state.tabFileList.length) {
      index = this.state.tabFileList.length - 1;
    }
    this.setState({tabFileList: this.state.tabFileList, activeKey: index >= 0 ? this.state.tabFileList[index] : '', txSendVisible: false});
  }

  updateSolTab = (oldFileName, newFileName) => {
    const index = this.state.tabFileList.indexOf(oldFileName);
    if (index > -1) {
      this.state.tabFileList.splice(index, 1, newFileName);
    }
    let activeLabKey = this.state.activeKey;
    if (activeLabKey == oldFileName) {
      activeLabKey = newFileName;
    }

    const solCode = global.localStorage.getItem('sol:' + oldFileName);
    global.localStorage.setItem('sol:' + newFileName, solCode);
    global.localStorage.removeItem('sol:' + oldFileName);

    this.setState({activeKey: activeLabKey, tabFileList: this.state.tabFileList, txSendVisible: false});
  }

  onClose = (targetKey) => {
    this.delSolTab(targetKey);
  }

  onEditFinish(key, label, node) {
    this.state.solFileList.map((solFileName, index) => {
      if (solFileName == key) {        
        this.state.solFileList[index] = label;
      }
    });
    if (this.state.selectedFileToCompile == key) {
      this.state.selectedFileToCompile = label;
    }
    this.state.contractList.map((contractFile, index) => {
      const contractInfos = contractFile.split(":");
      if (contractInfos[0] == key) {        
        this.state.contractList[index] = label + ":" + contractInfos[1];
      }
    });
    if (this.state.selectedContractToDeploy != null && this.state.selectedContractToDeploy.split(":")[0] == key) {
      this.state.selectedContractToDeploy = label + ":" + this.state.selectedContractToDeploy.split(":")[1];
    }

    this.setState({solFileList: this.state.solFileList, contractFile: this.state.contractList, txSendVisible: false});
    this.updateSolTab(key, label);
    CompilerSrv.renameSol(this.state.selectedAccountName, key, label);
  }

  onRightClick(info) {
    console.log('onRightClick', info);
  }
  
  isDisplayedFile(nodeName) {
    return nodeName.endsWith('.ui') || nodeName.endsWith('.bin') || nodeName.endsWith('.abi') || nodeName.endsWith('.rs');
  }

  onSelectSolFile = (selectedKeys) => {
    console.log('onSelectSolFile', selectedKeys);
    this.state.selectContactFile = selectedKeys[0];
    if (this.state.selectContactFile != null && this.isDisplayedFile(selectedKeys[0])) {
      this.addSolTab(this.state.selectContactFile);
    }
    if (this.state.selectContactFile.endsWith('.bin')) {
      const selectContactFile = this.state.selectContactFile.substr(0, this.state.selectContactFile.length - 4);
      this.onChangeContract(selectContactFile);
    }
  }
  
  addSolFile = () => {
    this.setState({addNewContractFileVisible: true, txSendVisible: false});
  }
  
  handleContractNameChange = (value) => {
    this.state.newContractFileName = value;
  }
  
  handleContractAccountNameChange = (value) => {
    this.setState({newContractAccountName: value});
  }
  
  handleContractPublicKeyChange = (value) => {
    this.setState({newContractPublicKey: value});
  }
  
  handleFTAmountChange = (value) => {
    this.setState({ftAmount: value});
  }
  
  handleGasPriceChange(v) {
    this.state.gasPrice = v;
  }
  handleGasLimitChange(v) {
    this.state.gasLimit = parseInt(v);
  }
  handlePasswordChange = (v) => {
    this.state.password = v;
  }
  onAddNewContractFileOK = () => {
    if (this.state.newContractFileName.search(/[:~!@#$%\^&*()<>?,]/) > -1) {
      Feedback.toast.error('????????????????????????');
      return;
    }
    if (!this.state.newContractFileName.endsWith('.rs')) {
      this.state.newContractFileName += '.rs';
    }
    let exist = false;
    this.state.solFileList.map(contractFileName => {
      if (this.state.newContractFileName == contractFileName) {
        exist = true;
      }
    });
    if (exist) {
      Feedback.toast.error('??????????????????');
      return;
    }

    this.state.solFileList.push(this.state.newContractFileName);
    this.setState({solFileList: this.state.solFileList, activeKey: this.state.newContractFileName, addNewContractFileVisible: false});
    this.addSolTab(this.state.newContractFileName);
    
    CompilerSrv.addSol(this.state.selectedAccountName, this.state.newContractFileName);
  }

  onAddNewContractFileClose = () => {
    this.setState({addNewContractFileVisible: false});
  }

  handleCompileSrvChange = (v) => {
    this.state.compileSrv = v;
  }

  onSetCompileSrvClose = () => {
    this.setState({compileSrvSettingVisible: false, txSendVisible: false});
  }  

  onAddContractABIOK = () => {
    if (!utils.isEmptyObj(this.state.contractABI) && !oexchain.utils.isValidABI(JSON.parse(this.state.contractABI))) {
      Feedback.toast.error(T('ABI????????????????????????????????????????????????'));
      return;
    }
    utils.storeContractABI(this.state.loadedContractAccount, JSON.parse(this.state.contractABI));
    const contractName = this.getContractName(this.state.loadedContractAccount);
    this.displayContractFunc(this.state.loadedContractAccount, utils.isEmptyObj(contractName) ? 'tmpName-' + utils.getRandomInt(10000) : contractName , JSON.parse(this.state.contractABI));
    this.setState({ contractInfoVisible: false });
  }

  onAddContractABIClose = () => {
    this.setState({ contractInfoVisible: false });
  }

  onDisplayABIOK = () => {
    copy(JSON.stringify(this.state.curAbi));
    Feedback.toast.success(T('ABI???????????????????????????'));
  }

  onDisplayABIClose = () => {
    this.setState({ displayAbiVisible: false });
  }

  onDisplayBINOK = () => {
    copy(this.state.curBin);
    Feedback.toast.success(T('BIN???????????????????????????'));
  }

  onDisplayBINClose = () => {
    this.setState({ displayBinVisible: false });
  }

  handleContractABIChange = (value) => {
    this.state.contractABI = value;
  }

  getFTBalance = (account) => {
    for(const balance of account.balances) {
      if (balance.assetID == Constant.SysTokenId) {
        return balance.balance;
      }
    }
    return 0;
  }
  checkBalanceEnough = (account, gasPrice, gasLimit, transferAmount) => {
    const ftBalance = this.getFTBalance(account);
    const gasValue = new BigNumber(gasPrice).multipliedBy(gasLimit).shiftedBy(9);
    const maxValue = new BigNumber(ftBalance);
    if (gasValue.comparedTo(maxValue) > 0) {
      return false;
    }
    const value = new BigNumber(transferAmount);
    const valueAddGasFee = value.plus(gasValue);

    if (valueAddGasFee.comparedTo(maxValue) > 0) {
      return false;
    }
    return true;
  }

  getSignIndex = (account, walletInfo) => {
    const authors = account.authors;
    let index = 0;
    for (const author of authors) {
      const owner = author.owner.toLowerCase();
      if (owner == walletInfo.signingKey.address.toLowerCase() || owner == walletInfo.signingKey.publicKey.toLowerCase()) {
        return index;
      }
      index++;
    }
    return -1;
  }

  sendTx = async (txInfo, fromAccount) => {
    const authors = fromAccount.authors;
    let threshold = fromAccount.threshold;
    const keystores = [utils.getDataFromFile(Constant.KeyStore)];
    if (keystores.length > 0) {
      let multiSigInfos = [];
      let promiseArr = [];
      for (const ethersKSInfo of keystores) {
        promiseArr.push(ethers.Wallet.fromEncryptedJson(JSON.stringify(ethersKSInfo), this.state.password));
      }

      const wallets = await Promise.all(promiseArr);
      for (let wallet of wallets) {
        const signInfo = await oexchain.oex.signTx(txInfo, wallet.privateKey);
        const index = this.getSignIndex(fromAccount, wallet);
        multiSigInfos.push({signInfo, indexes: [index]});
      }
      const actionName = txParser.getActionTypeStr(txInfo.actions[0].actionType);
      if (multiSigInfos.length > 0) {   
        Feedback.toast.success(fromAccount.accountName + '??????????????????:' + actionName);   
        this.addLog(fromAccount.accountName + '??????????????????:' + actionName);// + ', ????????????:' + JSON.stringify(txInfo));    
        const fatherLevel = 0;
        return oexchain.oex.sendSeniorSigTransaction(txInfo, multiSigInfos, fatherLevel);
        
        // .then(txHash => {
        //   this.addLog(actionName + '?????????hash:' + txHash);
        //   this.checkReceipt(actionName, txHash, cbFunc);
        // }).catch(error => {
        //   this.addLog(actionName + '??????????????????:' + error);
        //   Feedback.toast.error('?????????????????????' + error);
        // });
      }
    } else {
      Feedback.toast.error('????????????????????????????????????????????????????????????????????????');
    }
  }

  checkReceipt = (actionName, txHash, cbFunc) => {
    let count = 0;
    const intervalId = setInterval(() => {
      oexchain.oex.getTransactionReceipt(txHash).then(receipt => {
        if (receipt == null) {
          Feedback.toast.success('??????????????????');
          this.addLog('receipt???????????????????????????');
          count++;
          if (count == 3) {
            this.addLog('receipt???????????????????????????????????????');
            clearInterval(intervalId);
          }
        } else {
          this.addLog('receipt?????????');
          clearInterval(intervalId);
          const actionResults = receipt.actionResults;
          if (actionResults[0].status == 0) {
            Feedback.toast.error(actionName + T('???????????????????????????') + ':' + actionResults[0].error);
          } else if (cbFunc != null) {
            cbFunc();
          }
        }
      });
    }, 3000);
  }

  createAccountTx = (newAccountName, creator, publicKey, transferFTAmount, gasPrice, gasLimit) => {
    const payload = '0x' + encode([newAccountName, creator.accountName, publicKey, '']).toString('hex');
    let amountValue = new BigNumber(transferFTAmount).shiftedBy(Constant.SysTokenDecimal);
    amountValue = amountValue.comparedTo(new BigNumber(0)) == 0 ? 0 : '0x' + amountValue.toString(16);
    const txInfo = {};
    const actionInfo = { actionType: Constant.CREATE_NEW_ACCOUNT,
      accountName: creator.accountName,
      toAccountName: 'oexchain.account',  // oexchain.account
      assetId: Constant.SysTokenId,
      gasLimit,
      amount: amountValue,
      payload };
    txInfo.gasAssetId = Constant.SysTokenId;  // ft??????gas asset
    txInfo.gasPrice = new BigNumber(gasPrice).shiftedBy(9).toNumber();
    txInfo.actions = [actionInfo];

    return this.sendTx(txInfo, creator);
  }

  storeContractName = (contractAccountName, contractName) => {
    let storedName = utils.getDataFromFile(Constant.ContractNameFile);
    if (storedName != null) {
      storedName[contractAccountName] = contractName;
    } else {
      storedName = {};
      storedName[contractAccountName] = contractName;
    }
    utils.storeDataToFile(Constant.ContractNameFile, storedName);
  }
  
  getContractName = (contractAccountName) => {
    let storedName = utils.getDataFromFile(Constant.ContractNameFile);
    if (storedName != null) {
      return storedName[contractAccountName];
    }
    return null;
  }

  deployContractTx = async (contractAccountName, contractCode, gasPrice, gasLimit) => {
    const contractAccount = await oexchain.account.getAccountByName(contractAccountName);
    const payload = '0x' + contractCode;
    const txInfo = {};
    const actionInfo = { actionType: Constant.CREATE_CONTRACT,
      accountName: contractAccountName,
      toAccountName: contractAccountName,
      assetId: Constant.SysTokenId,
      gasLimit,
      amount: 0,
      payload };
    txInfo.gasAssetId = Constant.SysTokenId;  // ft??????gas asset
    txInfo.gasPrice = new BigNumber(gasPrice).shiftedBy(9).toNumber();
    txInfo.actions = [actionInfo];
    
    return this.sendTx(txInfo, contractAccount);
  }
  onDeployContractOK = async () => {
    if (this.state.newContractAccountName == null) {
      Feedback.toast.error(T('????????????????????????'));
      return;
    }

    if (utils.isEmptyObj(this.state.gasPrice)) {
      Feedback.toast.error(T('?????????GAS??????'));
      return;
    }

    if (utils.isEmptyObj(this.state.gasLimit)) {
      Feedback.toast.error(T('??????????????????????????????GAS??????'));
      return;
    }

    if (utils.isEmptyObj(this.state.password)) {
      Feedback.toast.error(T('?????????????????????'));
      return;
    }

    if (!this.state.accountReg.test(this.state.newContractAccountName) && this.state.newContractAccountName.length > 31) {
      Feedback.toast.error(T('??????????????????'));
      return;
    }
    
    const contractInfo = this.state.selectedContractToDeploy.split(':');      
    const contractCode = this.state.fileContractMap[contractInfo[0]][contractInfo[1]];
    if (contractCode == null) {
      Feedback.toast.error(T('????????????????????????'));
      return;
    }

    const values = [];
    let index = 0;
    for (let paraName of this.state.constructorParaNames) {
      let value = this.state.paraValue[this.state.curContractName + '-constructor-' + paraName];
      if (value == null) {
        Message.error(T('??????') + paraName + T('???????????????'));
        return;
      }
      const type = this.state.constructorParaTypes[index];
      if (type == 'bool') {
        value = ((value == 'false' || value == 0) ? false : true);
        values.push(value);
      } else if (type.lastIndexOf(']') === type.length - 1) {
        if (value.indexOf('[') != 0 || value.lastIndexOf(']') != value.length - 1) {
          Message.error(T('??????????????????????????????????????????:' + '[a,b,c]'));
          return;
        }          
        values.push(value.substr(1, value.length - 2).split(','));
      } else {
        values.push(value);
      }
      index++;
    }
    const constructorPayload = abiUtil.rawEncode(this.state.constructorParaTypes, values).toString('hex');

    Feedback.toast.success(T('??????????????????'));
    this.addLog(T('??????????????????'));
    const contractAccount = await oexchain.account.getAccountByName(this.state.newContractAccountName);
    if (contractAccount != null) {
      if (!this.checkBalanceEnough(contractAccount, this.state.gasPrice, this.state.gasLimit, this.state.ftAmount)) {        
        Feedback.toast.error(T('OEX?????????????????????????????????'));
        return;
      }
      // ????????????????????????????????????????????????
      this.deployContractTx(this.state.newContractAccountName, contractCode.bin + constructorPayload, this.state.gasPrice, this.state.gasLimit).then(txHash => {
        this.addLog(T('?????????????????????hash:') + txHash);
        this.checkReceipt(T('????????????'), txHash, () => {
          Feedback.toast.success(T('??????????????????'));
          this.processContractDepolyed(this.state.newContractAccountName, contractInfo[0], contractInfo[1], JSON.parse(contractCode.abi));
          this.setState({deployContractVisible: false, txSendVisible: false});
        });
      }).catch(error => {
        this.addLog(T('??????????????????????????????:') + error);
        Feedback.toast.error(T('??????????????????????????????:') + error);
      });
      Feedback.toast.success(T('??????????????????'));
    } else {
      if (utils.isEmptyObj(this.state.selectedAccountName)) {
        Feedback.toast.error(T('????????????????????????'));
        return;
      }

      if (utils.isEmptyObj(this.state.newContractPublicKey)) {
        Feedback.toast.error(T('??????????????????????????????'));
        return;
      }

      if (utils.isEmptyObj(this.state.ftAmount)) {
        Feedback.toast.error(T('?????????OEX????????????'));
        return;
      }
      
      const publicKey = utils.getPublicKeyWithPrefix(this.state.newContractPublicKey);
      if (!ethUtil.isValidPublic(Buffer.from(utils.hex2Bytes(publicKey)), true)) {
        Feedback.toast.error(T('??????????????????????????????'));
        return;
      }
      if (!this.checkBalanceEnough(this.state.selectedAccount, this.state.gasPrice, this.state.gasLimit, this.state.ftAmount)) {        
        Feedback.toast.error(T('OEX?????????????????????????????????'));
        return;
      }
      // 1:?????????????????????????????????
      this.createAccountTx(this.state.newContractAccountName, this.state.selectedAccount, publicKey,
                           this.state.ftAmount, this.state.gasPrice, this.state.gasLimit).then(txHash => {
        this.addLog(T('?????????????????????hash:') + txHash);
        this.checkReceipt(T('????????????'), txHash, () => {
          // 2:???????????????????????????
          Feedback.toast.success(T('????????????????????????????????????????????????????????????'));  
          this.addLog(T('???????????????????????????????????????'));    
          this.deployContractTx(this.state.newContractAccountName, contractCode.bin + constructorPayload, this.state.gasPrice, this.state.gasLimit).then(txHash => {
            this.addLog(T('?????????????????????hash:') + txHash);
            this.checkReceipt(T('????????????'), txHash, () => {
              Feedback.toast.success(T('??????????????????')); 
              this.setState({deployContractVisible: false, txSendVisible: false}); 
              this.processContractDepolyed(this.state.newContractAccountName, contractInfo[0], contractInfo[1], JSON.parse(contractCode.abi));
            });
          }).catch(error => {
            this.addLog(T('??????????????????????????????:') + error);
            Feedback.toast.error(T('??????????????????????????????:') + error);
          });
        });
      });
    }
  }

  processContractDepolyed = (contractAccountName, solFileName, contractName, contractAbi) => {
    if (this.checkABI(contractAbi)) {

      this.state.contractAccountMap[solFileName + ':' + contractName] = contractAccountName;
      this.state.accountContractInfoMap[contractAccountName] = {contractAccountName, solFileName, contractName, contractAbi, createDate: new Date().toLocaleString()};
      
      this.displayContractFunc(contractAccountName, solFileName, contractName, contractAbi);
      this.storeContractName(contractAccountName, contractName);
      utils.storeContractABI(contractAccountName, contractAbi);
    }
  }

  displayContractFunc = (contractAccountName, solFileName, contractName, contractAbi) => {
    this.state.contractAccountInfo = [{contractAccountName, solFileName, contractName, contractAbi, createDate: new Date().toLocaleString()}, ...this.state.contractAccountInfo];
    
    global.localStorage.setItem('contractAccountInfo', JSON.stringify(this.state.contractAccountInfo));
    
    this.setState({contractAccountInfo: this.state.contractAccountInfo, txSendVisible: false});
  }

  onDeployContractClose = () => {
    this.setState({deployContractVisible: false});
  }
  delSolFile = () => {
    if (this.state.selectContactFile.length > 0) {
      const index = this.state.solFileList.indexOf(this.state.selectContactFile);
      if (index > -1) {
        this.state.solFileList.splice(index, 1);
        this.setState({solFileList: this.state.solFileList});
        this.delSolTab(this.state.selectContactFile);
        CompilerSrv.delSol(this.state.selectedAccountName, this.state.selectContactFile);
      }
    }
  }
  saveSolFile = () => {
    if (this.state.selectContactFile.length > 0) {
      const index = this.state.solFileList.indexOf(this.state.selectContactFile);
      if (index > -1) {
        const fileName = this.state.selectContactFile;
        const fileContent = global.localStorage.getItem('sol:' + fileName);
        utils.doSave(fileContent, 'text/latex', fileName);
      }
    } else {
      Notification.displayWarningInfo('?????????????????????????????????????????????');
    }
  }
  onCreateAccountOK = async () => {
    if (this.state.firstAccountName == null) {
      Feedback.toast.error('??????????????????');
      return;
    }

    if (utils.isEmptyObj(this.state.password)) {
      Feedback.toast.error('???????????????(?????????)??????');
      return;
    }

    if (!this.state.accountReg.test(this.state.firstAccountName)) {
      Feedback.toast.error(T('??????????????????'));
      return;
    }

    if (!this.state.passwordReg.test(this.state.password)) {
      Feedback.toast.error(T('??????????????????'));
      return;
    }

    if (this.state.dupPassword != this.state.password) {
      Feedback.toast.error(T('???????????????'));
      return;
    }
    try {
      let publicKey = '';
      const allKeys = keystore.getAllKeys();
      if (allKeys.length > 0) {
        publicKey = allKeys[0]['publicKey'];
      } else {
        const ksInfoObj = await keystore.init(this.state.password);
        publicKey = ksInfoObj['publicKey'];
      }
      const chainId = oexchain.oex.getChainId();
      const rpcInfo = Constant.chainId2RPC[chainId];
      const srvRequest = Constant.proxySrvAddr[chainId] + '/wallet_account_creation?accname=' 
                  + this.state.firstAccountName + '&pubkey=' + publicKey + '&deviceid=webWallet' 
                  + '&rpchost=' + rpcInfo.rpcHost + '&rpcport=' + rpcInfo.rpcPort
                  + '&chainid=' + chainId;

      const self = this;
      //Feedback.toast.success('??????????????????');
      Message.show({
        content: '??????????????????'
      });
      fetch(srvRequest).then(function(response) {
        return response.json();
      }).then(function(result) {
        console.log(result);
        if (result.code == 200) {
          //Feedback.toast.success('??????????????????');
          Message.show({
            type: 'loading',
            content: '??????????????????',
            duration: 10000,
          });
          setTimeout(() => {
            oexchain.oex.getTransactionReceipt(result.msg).then(receipt => {
              if(receipt != null) {
                const status = receipt.actionResults[0].status;
                if (status == 1) {
                  oexchain.account.getAccountByName(self.state.firstAccountName).then(account => {
                    if (account != null) {
                      Message.show({
                        content: '??????????????????'
                      });

                      self.setState({ createAccountVisible: false });
                      utils.storeDataToFile(Constant.AccountFile, [self.state.firstAccountName]);
                    } else {
                      Message.show({
                        type: 'warning',
                        content: '???????????????????????????????????????????????????????????????10s??????'
                      });
                    }
                  });
                } else {
                  const error = receipt.actionResults[0].error;
                  Message.show({
                    type: 'error',
                    content: '??????????????????:' + error
                  });
                }
              } else {
                copy(result.msg);
                Message.show({
                  type: 'warning',
                  content: '??????????????????????????????hash?????????????????????????????????????????????'
                });
              }
            });
          }, 6000);
        } else {
          Message.show({
            type: 'error',
            content: '??????????????????:' + result.msg
          });
        }
      });
    } catch (error) {
      Feedback.toast.error(error.message);      
    }
  }
  
  onCreateAccountClose = () => {
    this.setState({createAccountVisible: false});
  }

  handleNewAccountNameChange = (v) => {
    this.state.firstAccountName = v;
  }

  handleDupPasswordChange = (v) => {
    this.state.dupPassword = v;
  }

  render() {
    global.localStorage.setItem("solFileList", this.state.solFileList);
    const self = this;
    const addContractBtn = <Button style={styles.icon} text iconSize='xs' onClick={this.addSolFile.bind(this)}> <Icon size='small' type="add"/> </Button>
    const delContractBtn = <Button style={styles.icon} text iconSize='xs' onClick={this.delSolFile.bind(this)}> <Icon size='small' type="ashbin"/> </Button>
    const saveContractBtn = <Button style={styles.icon} text iconSize='xs' onClick={this.saveSolFile.bind(this)}> <Icon size='small' type="download"/> </Button>
    const compileContractBtn = <Button style={styles.icon} text iconSize='xs' onClick={this.compileContract.bind(this)}> <Icon size='small' type="refresh"/> </Button>
    const deployContractBtn = <Button style={styles.icon} text iconSize='xs' onClick={this.deployContract.bind(this)}> <Icon size='small' type="calendar"/> </Button>

    return (
      <Row sytle={styles.all}>
        {/* <Container style={styles.banner}/> */}
        {/* <Container style={{ display: 'flex', width: '100%', height: '100%' }}> */}
          {/* <Shell className={styles.iframeHack} device='desktop' type='dark' style={{border: '1px solid #eee'}}>
            <Shell.LocalNavigation collapse={this.state.collapse} style={{backgroundColor: '#373738', width: this.state.width}} 
                                   onCollapseChange={()=> this.setState({collapse: !this.state.collapse, width: this.state.width != 0 ? 0 : 250})}> */}
            <Col span={4} style={{backgroundColor: '#373738'}}>
              <Row justify='end'>
                <Balloon trigger={addContractBtn} closable={false}>
                    {T('????????????')}
                </Balloon>
                <Balloon trigger={delContractBtn} closable={false}>
                    {T('??????????????????')}
                </Balloon>
                <Balloon trigger={saveContractBtn} closable={false}>
                    {T('????????????')}
                </Balloon>
                <Balloon trigger={compileContractBtn} closable={false}>
                    {T('????????????')}
                </Balloon>
                <Balloon trigger={deployContractBtn} closable={false}>
                    {T('????????????')}
                </Balloon>
              </Row>
              <Tree editable showLine draggable selectable
                  style={{ marginTop: '-25px', marginLeft: '12px' }}
                  defaultExpandedKeys={['0', '1', '2']}
                  onEditFinish={this.onEditFinish.bind(this)}
                  onRightClick={this.onRightClick}
                  onSelect={this.onSelectSolFile}>
                   <TreeNode key="0" label={T('??????')} selectable={false}>
                    {
                      this.state.solFileList.map(solFile => {
                        if (this.state.fileContractMap[solFile] != null) {
                          const compiledInfo = this.state.fileContractMap[solFile];
                          const solInfoList = [];
                          for (var contractName in compiledInfo) {
                            const key = solFile + ':' + contractName;
                            var deployedContract = null;
                            if (this.state.contractAccountMap[key] != null) {
                              deployedContract = <TreeNode key={this.state.contractAccountMap[key] + '.ui'} label={this.state.contractAccountMap[key] + '.ui'}/>
                            }
                            const contractNode = <TreeNode key={key} label={<font color='white'>{contractName}</font>}>
                              <TreeNode key={solFile + ':' + contractName + '.abi'} label={contractName + '.abi'}/>
                              <TreeNode key={solFile + ':' + contractName + '.bin'} label={contractName + '.bin'}/>
                              {deployedContract}
                            </TreeNode>
                            solInfoList.push(contractNode);
                          }
                          return <TreeNode key={solFile} label={solFile}>
                                  {[...solInfoList]}
                                </TreeNode>;
                        } else {
                          return <TreeNode key={solFile} label={solFile}/>;
                        }
                      })
                    }
                  </TreeNode>
                  
                  <TreeNode key="1" label={<font color='white'>{T('??????(????????????)')}</font>} selectable={false}>
                    {
                      this.state.smapleFileList.map(solFile => <TreeNode key={solFile} label={solFile}/>)
                    }
                  </TreeNode>
              </Tree>
              &nbsp;&nbsp;
              <a href='https://github.com/solana-labs/solana/wiki/Learning-Blockchain,-Crypto,-and-Solana' target="_blank" rel="noopener noreferrer">{T('?????????Wiki')}</a>
              </Col>
            {/* </Shell.LocalNavigation>  } tabRender={(key, props) => <CustomTabItem key={key} {...props} />} 
            <Shell.Content > */}
            <Col span={20}>
              <Row> 
                <Tab shape='capsule' navStyle={{ background: '#373738' }} activeKey={this.state.activeKey} excessMode="slide" onClose={this.onClose.bind(this)} onClick={this.selectTab}>
                  {
                    this.state.tabFileList.map(fileName => {
                      if (fileName.endsWith('.ui')) {
                        const accountName = fileName.substr(0, fileName.length - '.ui'.length);
                        const contractInfo = this.state.accountContractInfoMap[accountName];
                        return (<Tab.Item closeable={true} key={fileName} title={fileName} style={styles.tabStyle} closeFunc={this.onClose}>
                                  <ContractArea self={this} contract={contractInfo}/>
                              </Tab.Item>);
                      } else {
                        var constantContent = null;
                        var fileType = 'sol';
                        if (fileName.endsWith('.abi') || fileName.endsWith('.bin')) {
                          const contractInfo = fileName.split(':');      
                          const contractName = contractInfo[1].split('.')[0];
                          const contractCode = this.state.fileContractMap[contractInfo[0]][contractName];
                          if (contractCode != null) {
                            constantContent = fileName.endsWith('.abi') ? contractCode.abi : contractCode.bin;
                            fileType = fileName.endsWith('.abi') ? 'abi' : 'bin';
                          }
                        }
                        return (<Tab.Item closeable={true} key={fileName} title={fileName} style={styles.tabStyle} closeFunc={this.onClose}>
                                  <ContractEditor height={window.innerHeight - extraHeight} fileType={fileType} fileName={fileName} constantContent={constantContent} accountName={this.state.selectedAccountName}/>                                
                                </Tab.Item>);
                      }
                    }
                            
                    )
                  }
                </Tab>
              </Row>
              <Row style={{ height: 200, backgroundColor: '#373738' }}>
                <Input.TextArea hasClear
                  rows={20}
                  value={this.state.resultInfo}
                  size="medium"
                  onChange={this.changeLog.bind(this)}
                />
              </Row>
            </Col>
            {/* </Shell.Content>
          </Shell> */}
        
        <Dialog language={T('zh-cn')} style={{width: '400px'}}
          visible={this.state.constructorVisible}
          title={T("????????????")}
          closeable="true"
          footerAlign="center"
          onOk={this.onConstructOK.bind(this)}
          onCancel={() => this.setState({constructorVisible: false})}
          onClose={() => this.setState({constructorVisible: false})}
        >
          <Parameters self={this} width='250' contractName={this.state.curContractName} funcName='constructor' 
                    parameterNames={this.state.constructorParaNames} parameterTypes={this.state.constructorParaTypes} />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{width: '400px'}}
          visible={this.state.addNewContractFileVisible}
          title={T("???????????????????????????")}
          closeable="true"
          footerAlign="center"
          onOk={this.onAddNewContractFileOK.bind(this)}
          onCancel={this.onAddNewContractFileClose.bind(this)}
          onClose={this.onAddNewContractFileClose.bind(this)}
        >
          <Input hasClear autoFocus
            onChange={this.handleContractNameChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("???????????????")}
            size="medium"
            onPressEnter={this.onAddNewContractFileOK.bind(this)}
          />
        </Dialog>
        <Dialog closeable='close,esc,mask' language={T('zh-cn')} style={{width: '400px'}}
          visible={this.state.contractInfoVisible}
          title={T("??????????????????ABI??????")}
          footerAlign="center"
          onOk={this.onAddContractABIOK.bind(this)}
          onCancel={this.onAddContractABIClose.bind(this)}
          onClose={this.onAddContractABIClose.bind(this)}
        >
          <Input hasClear multiple
            onChange={this.handleContractABIChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("ABI??????")}
            size="medium"
            defaultValue={this.state.originalABI}
            hasLimitHint
          />
        </Dialog>
        
        <Dialog closeable='close,esc,mask' language={T('zh-cn')} style={{width: '400px'}}
          visible={this.state.displayAbiVisible}
          title={T("??????ABI??????")}
          footerAlign="center"
          onOk={this.onDisplayABIOK.bind(this)}
          onCancel={this.onDisplayABIClose.bind(this)}
          onClose={this.onDisplayABIClose.bind(this)}
          okProps={{children: T('??????ABI')}}
        >
          <ReactJson src={this.state.curAbi} displayDataTypes={false} style={{backgroundColor: '#fff'}}/>
        </Dialog>

        <Dialog closeable='close,esc,mask' language={T('zh-cn')} style={{width: '400px'}}
          style={{ width: '500px' }}
          visible={this.state.displayBinVisible}
          title={T("??????BIN??????")}
          footerAlign="center"
          onOk={this.onDisplayBINOK.bind(this)}
          onCancel={this.onDisplayBINClose.bind(this)}
          onClose={this.onDisplayBINClose.bind(this)}
          okProps={{children: T('??????BIN')}}
        >
          <IceEllipsis lineNumber={10} text= {this.state.curBin} />
        </Dialog>

        <Dialog closeable='close,esc,mask' language={T('zh-cn')} style={{width: '400px'}}
          visible={this.state.deployContractVisible}
          title={T("????????????")}
          closeable="true"
          footerAlign="center"
          onOk={this.onDeployContractOK.bind(this)}
          onCancel={this.onDeployContractClose.bind(this)}
          onClose={this.onDeployContractClose.bind(this)}
        >
          <Input hasClear
            onChange={this.handleContractAccountNameChange.bind(this)}
            value={this.state.newContractAccountName}
            style={styles.inputBoder}
            innerBefore={T("???????????????")}
            size="medium"
          />
          <br/>
          <br/>
          <Input hasClear
            onChange={this.handleContractPublicKeyChange.bind(this)}
            value={this.state.newContractPublicKey}
            style={styles.inputBoder}
            innerBefore={T("??????")}
            size="medium"
          />
          <br/>
          <br/>
          <Input hasClear
            onChange={this.handleFTAmountChange.bind(this)}
            defaultValue={this.state.ftAmount}
            style={styles.inputBoder}
            innerBefore={T("????????????")}
            innerAfter='OEX'
            size="medium"
          />
          <br/>
          <br/>
          <Input hasClear
            onChange={this.handleGasPriceChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("GAS??????")}
            innerAfter="Gaoex"
            size="medium"
            defaultValue={this.state.gasPrice}
            hasLimitHint
          />
          <br />
          <font color='#fff'>1Gaoex = 10<sup>-9</sup>oex = 10<sup>9</sup>aoex</font>
          <br />
          <br />
          <Input hasClear hasLimitHint
            onChange={this.handleGasLimitChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("GAS????????????")}
            size="medium"
            defaultValue={this.state.gasLimit}
          />
          <br />
          <br />
          <Input hasClear
            htmlType="password"
            onChange={this.handlePasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("????????????")}
            size="medium"
            defaultValue=""
            maxLength={20}
            hasLimitHint
            onPressEnter={this.onDeployContractOK.bind(this)}
          />
        </Dialog>
        <Dialog language={T('zh-cn')} style={{width: '400px'}}
          visible={this.state.createAccountVisible}
          onOk={this.onCreateAccountOK.bind(this)}
          onCancel={this.onCreateAccountClose.bind(this)}
          onClose={this.onCreateAccountClose.bind(this)}
          title={T("????????????")}
          footerAlign="center"
        >
          <Input hasClear autoFocus
            onChange={this.handleNewAccountNameChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("??????")}
            size="medium"
            defaultValue=""
            maxLength={16}
            hasLimitHint
            placeholder={T("????????????,???a-z0-9??????,12~16???")}
          />
          <br />
          <br />
          <Input hasClear 
            htmlType="password"
            onChange={this.handlePasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("??????")}
            placeholder={T("????????????????????????,?????????8???,?????????????????????")}
            size="medium"
            maxLength={132}
            hasLimitHint
          />
          <br />
          <br />
          <Input hasClear
            htmlType="password"
            onChange={this.handleDupPasswordChange.bind(this)}
            style={styles.inputBoder}
            innerBefore={T("????????????")}
            size="medium"
            maxLength={132}
            hasLimitHint
            onPressEnter={this.onCreateAccountOK.bind(this)}
          />
        </Dialog>
        <TxSend visible={this.state.txSendVisible} txInfo={this.state.txInfo} accountName={this.state.selectedAccountName} sendResult={this.getTxResult.bind(this)}/>
      </Row>
    );
  }
}

const styles = {
  all: {
    height: 'auto',
    background: '#f5f6fa',
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'center'
  },
  banner: {
    width: '100%', 
    height: '310px', 
    paddingBottom: '-30px',
    backgroundColor: '#080a20',
    display: 'flex',
    justifyContent: 'start',
    flexDirection: 'column',
    alignItems: 'center'
  },
  btn: {
    borderRadius: '2px',
    backgroundColor: '#5c67f2'
  },
  selectAndBtn: {
    display: 'flex',
    justifyContent: 'start',
    alignItems: 'center'
  },
  inputBoder: {
    
  },
  selectBoder: {
    borderBottom: '1px solid #dbdbdb',
    borderTop: '0px',
    borderLeft: '0px',
    borderRight: '0px',
  },
  dialogBtn: {
    width: '100%',
    height: '60px',
    borderRadius: '2px',
    backgroundColor: '#5c67f2'
  },
  tabStyle: {
    height:'30px',
    textAlign: 'center',
    borderRadius: 0,
    border: '0px solid #282828',
    marginRight: 2,
    paddingTop: '7px'
  },
  rowStyle: {
    height:'25px',
    backgroundColor: '#373738'
  },
  iframeHack: {
    width: '100%',
    height: '100%'
  },
  icon: {
    marginRight: '8px'
  }
}