package com.hospital.audit.contract;

import io.reactivex.Flowable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.maven.plugins:web3j-maven-plugin to regenerate this file.
 */
public class MedicalAudit extends Contract {
    public static final String BINARY = "Your Binary Here - Omitted for brevity as we load by address";

    public static final String FUNC_LOGACTION = "logAction";

    public static final String FUNC_GETLOGS = "getLogs";

    public static final String FUNC_GETLOGCOUNT = "getLogCount";

    public static final Event ACTIONLOGGED_EVENT = new Event("ActionLogged", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Utf8String>() {}, new TypeReference<Uint256>() {}));
    ;

    @Deprecated
    protected MedicalAudit(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected MedicalAudit(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected MedicalAudit(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected MedicalAudit(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static List<ActionLoggedEventResponse> getActionLoggedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(ACTIONLOGGED_EVENT, transactionReceipt);
        ArrayList<ActionLoggedEventResponse> responses = new ArrayList<ActionLoggedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            ActionLoggedEventResponse typedResponse = new ActionLoggedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.logId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
            typedResponse.action = (String) eventValues.getNonIndexedValues().get(1).getValue();
            typedResponse.userId = (String) eventValues.getNonIndexedValues().get(2).getValue();
            typedResponse.details = (String) eventValues.getNonIndexedValues().get(3).getValue();
            typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(4).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public Flowable<ActionLoggedEventResponse> actionLoggedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(new io.reactivex.functions.Function<Log, ActionLoggedEventResponse>() {
            @Override
            public ActionLoggedEventResponse apply(Log log) {
                Contract.EventValuesWithLog eventValues = extractEventParametersWithLog(ACTIONLOGGED_EVENT, log);
                ActionLoggedEventResponse typedResponse = new ActionLoggedEventResponse();
                typedResponse.log = log;
                typedResponse.logId = (BigInteger) eventValues.getNonIndexedValues().get(0).getValue();
                typedResponse.action = (String) eventValues.getNonIndexedValues().get(1).getValue();
                typedResponse.userId = (String) eventValues.getNonIndexedValues().get(2).getValue();
                typedResponse.details = (String) eventValues.getNonIndexedValues().get(3).getValue();
                typedResponse.timestamp = (BigInteger) eventValues.getNonIndexedValues().get(4).getValue();
                return typedResponse;
            }
        });
    }

    public Flowable<ActionLoggedEventResponse> actionLoggedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(ACTIONLOGGED_EVENT));
        return actionLoggedEventFlowable(filter);
    }

    public RemoteFunctionCall<TransactionReceipt> logAction(String action, String userId, String details) {
        final Function function = new Function(
                FUNC_LOGACTION, 
                Arrays.<Type>asList(new Utf8String(action), new Utf8String(userId), new Utf8String(details)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    // Méthode getLogs supprimée car elle nécessite la gestion complexe des Structs Solidity
    // Pour lire les logs, nous utiliserons plutôt les événements (ActionLoggedEvent)


    public RemoteFunctionCall<BigInteger> getLogCount() {
        final Function function = new Function(FUNC_GETLOGCOUNT, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Uint256>() {}));
        return executeRemoteCallSingleValueReturn(function, BigInteger.class);
    }

    @Deprecated
    public static MedicalAudit load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new MedicalAudit(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static MedicalAudit load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new MedicalAudit(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static MedicalAudit load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new MedicalAudit(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static MedicalAudit load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new MedicalAudit(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static class ActionLoggedEventResponse extends BaseEventResponse {
        public BigInteger logId;

        public String action;

        public String userId;

        public String details;

        public BigInteger timestamp;
    }
}
