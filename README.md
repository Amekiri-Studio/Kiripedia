# Kiripedia

Kiripedia 是一个后端基于Express.js框架，前端基于Vue3，并使用Markdown作为词条版面的一个百科类网站

## API统一规范：

### API返回格式

API返回一般为下面的JSON格式：

{
  "code":0,
  "message":"successful",
  "data":{
    databody
  }
}

| 对象属性 | 名称 | 作用 |
|-|-|-|
| code | 返回码 | 告诉前端返回状态 
| message | 返回消息 | 传递查询/请求后的消息 |
| data | 返回数据 | 可以包含查询获取到的信息，也可以包含提交数据后的信息 |

### API返回状态对应的返回码
|  状态   | 返回码  |
|  ----   | ----    |
|  成功   |    0    |
| 没有数据/查询失败  | -1  |
| 发生错误 |    500   |

### 用户组权限
| 权限 |  数值 |
|----|----|
| 没有权限| 0 |
| 基本权限（创建词条、分类，删除（只支持自己创建的）） | 1 |
| 词条、分类管理（创建，删除，锁定，回滚） | 2 |
| 用户组管理（创建，修改，删除） | 4 |
| 用户过往信息查看（包括曾经的邮箱，昵称） | 8 |
| 用户封禁、解封，IP封禁，解封 | 16 |

其中只要是0就没有权限，1以上有对应权限

需要多个权限可以相加，比如基本权限+词条、分类管理就可以1+2=3

为确保安全，普通用户只能删除只有自己编辑过的词条

### 用户状态
| 状态 | 代码 |
| - | - |
| 正常 | 0 |
| 已注销| -1 |
| 封禁 | -2 |

### 词条权限
| 状态 | 代码 |
| - | - |
| 任意编辑 | 1 |
| 锁定 | 0 |

## 功能实现（后端）：

- [x] 用户模块
  - [x] 注册
  - [x] 登录
  - [x] 修改邮箱（已登录的情况）
  - [x] 修改密码（已登录的情况）
  - [x] 重置密码
  - [x] 邮箱验证码
  - [x] 修改昵称
  - [x] 修改头像
  - [x] 用户注销

- [ ] 词条
  - [x] 添加词条（支持添加其他语言）
  - [x] 修改词条
  - [ ] 删除词条（单个语言与整个词条）
  - [x] 查询词条

- [ ] 管理员
  - [ ] 锁定词条
  - [ ] 封禁用户
  - [ ] 封禁IP
  - [ ] 配置同义词条重定向
  - [ ] 解封用户
  - [ ] 修改用户组权限

- [ ] 其他
  - [ ] 图片上传（可由前端完成）
  - [ ] 日志保存