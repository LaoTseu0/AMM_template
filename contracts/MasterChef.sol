// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20.sol";
import "./IERC20.sol";
import "./SafeERC20.sol";
import "./EnumerableSet.sol";
import "./SafeMath.sol";
import "./Ownable.sol";
import "./YinToken.sol";

interface IMigratorChef {
    function migrate(IERC20 token) external returns (IERC20);
}

contract MasterChef is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
    }

    struct PoolInfo {
        IERC20 lpToken; // Address of LP token contract.
        uint256 allocPoint; // How many allocation points assigned to this pool. YINs to distribute per block.
        uint256 lastRewardBlock; // Last block number that YINs distribution occurs.
        uint256 accYinPerShare; // Accumulated YINs per share, times 1e12. See below.
    }

    YinToken public yin;
    address public devaddr;
    uint256 public bonusEndBlock;
    uint256 public yinPerBlock;
    uint256 public constant BONUS_MULTIPLIER = 1;
    IMigratorChef public migrator;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 public totalAllocPoint = 0;
    uint256 public startBlock;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Harvest(address indexed user, uint256 indexed pid);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(
        YinToken _yin,
        address _devaddr,
        uint256 _yinPerBlock,
        uint256 _startBlock,
        uint256 _bonusEndBlock
    ) public {
        yin = _yin;
        devaddr = _devaddr;
        yinPerBlock = _yinPerBlock;
        bonusEndBlock = _bonusEndBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    // Ajouter une nouvelle pool //
    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accYinPerShare: 0
            })
        );
    }

    // parametré une pool ( index, allocationPoint,  + massUdpatePool ou pas(bool)) //
    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    // cette fonction retourne la reward évaluer pour une pédiode de temps(en nombre de block ( x jusqu'a y)) du jeton natif //
    function getMultiplier(uint256 _from, uint256 _to)
        public
        view
        returns (uint256)
    {
        if (_to <= bonusEndBlock) {
            return _to.sub(_from).mul(BONUS_MULTIPLIER);
        } else if (_from >= bonusEndBlock) {
            return _to.sub(_from);
        } else {
            return
                bonusEndBlock.sub(_from).mul(BONUS_MULTIPLIER).add(
                    _to.sub(bonusEndBlock)
                );
        }
    }

    // Affiche la reward en attente de retrait pour une clés {Pool => user} donner.
    function pendingYin(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accYinPerShare = pool.accYinPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        //çi dessus, nombre de block passer depuis le dernier Harvest, Si le block actuel et supérieur au dernier block reward //
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            // calcule içi la reward a claim //
            uint256 yinReward = multiplier
                .mul(yinPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accYinPerShare = accYinPerShare.add(
                yinReward.mul(1e12).div(lpSupply)
            );
        }
        return user.amount.mul(accYinPerShare).div(1e12).sub(user.rewardDebt);
    }

    // update chacunes des Pools pour mettre a jours le mint() & TotalSupply //
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    // update de la Pool selectionner ( par son ID => _pid) pour activé le mint() et ainsi mettre a jours la TotalSupply //
    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 yinReward = multiplier
            .mul(yinPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);
        yin.mint(devaddr, yinReward.div(10));
        yin.mint(address(this), yinReward);
        pool.accYinPerShare = pool.accYinPerShare.add(
            yinReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    // le Depôt dans une Pool, actualise la Pool ET envois la reward en attente, a l'utilisateur //
    //@Dev c'est le MasterChef qui call() //
    function deposit(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user
                .amount
                .mul(pool.accYinPerShare)
                .div(1e12)
                .sub(user.rewardDebt);
            if (pending > 0) {
                safeYinTransfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            pool.lpToken.safeTransferFrom(
                address(msg.sender),
                address(this),
                _amount
            );
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accYinPerShare).div(1e12);
        emit Deposit(msg.sender, _pid, _amount);
    }

    // le Retrais, actualise la Pool ET envois la reward en attente, a l'utilisateur //
    //@Dev c'est le MasterChef qui call() //
    function withdraw(uint256 _pid, uint256 _amount) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(user.amount >= _amount, "withdraw: not good");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accYinPerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            safeYinTransfer(msg.sender, pending);
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            pool.lpToken.safeTransfer(address(msg.sender), _amount);
        }
        user.rewardDebt = user.amount.mul(pool.accYinPerShare).div(1e12);
        emit Withdraw(msg.sender, _pid, _amount);
    }

    // Harvest Basic, engendre une mise a jorus de la Pool et donc le mint() => reward //
    function harvest(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accYinPerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            safeYinTransfer(msg.sender, pending);
        }
        user.rewardDebt = user.amount.mul(pool.accYinPerShare).div(1e12);
        emit Harvest(msg.sender, _pid);
    }

    //Le Retrais d'urgence n'active pas le mint de tokens, donc l'utilisateur n'obtient pas la reward//
    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        pool.lpToken.safeTransfer(address(msg.sender), user.amount);
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
    }

    //Fonction safe de transfer basic, en cas d'erreur dans une Pool//
    function safeYinTransfer(address _to, uint256 _amount) internal {
        uint256 yinBal = yin.balanceOf(address(this));
        if (_amount > yinBal) {
            yin.transfer(_to, yinBal);
        } else {
            yin.transfer(_to, _amount);
        }
    }

    // fonction pour changer l'address du Dev " On passe la main ! "
    function dev(address _devaddr) public {
        require(msg.sender == devaddr, "dev: wut?");
        devaddr = _devaddr;
    }
}
