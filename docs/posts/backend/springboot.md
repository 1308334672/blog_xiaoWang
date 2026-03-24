---
title: Spring Boot
---

# Spring Boot 🌱

> Spring Boot 让 Spring 应用开发变得简单快速！

## 快速开始

访问 [start.spring.io](https://start.spring.io/) 生成项目骨架，或使用 IDE 向导。

**推荐依赖：**
- Spring Web
- Spring Data JPA
- MySQL Driver
- Lombok

## 项目结构

```
src/main/java/com/example/
├── controller/     # 控制层（处理请求）
├── service/        # 业务层（业务逻辑）
├── repository/     # 数据层（操作数据库）
├── entity/         # 实体类
├── dto/            # 数据传输对象
└── Application.java
```

## 创建 REST API

```java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 查询所有用户
    @GetMapping
    public List<User> getAll() {
        return userService.findAll();
    }

    // 根据 ID 查询
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // 创建用户
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public User create(@RequestBody @Valid UserDTO dto) {
        return userService.create(dto);
    }

    // 更新用户
    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody @Valid UserDTO dto) {
        return userService.update(id, dto);
    }

    // 删除用户
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.deleteById(id);
    }
}
```

## application.yml 配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?useSSL=false&characterEncoding=UTF-8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8080
```

## 常用注解速查

| 注解 | 说明 |
|------|------|
| `@SpringBootApplication` | 主启动类 |
| `@RestController` | 控制器（返回 JSON） |
| `@Service` | 业务层 |
| `@Repository` | 数据层 |
| `@Autowired` / `@RequiredArgsConstructor` | 依赖注入 |
| `@GetMapping` / `@PostMapping` | 请求映射 |
| `@PathVariable` | 路径参数 |
| `@RequestBody` | 请求体 |
| `@Valid` | 参数校验 |

::: tip 🎯 最佳实践
- 使用构造器注入（`@RequiredArgsConstructor`）而非 `@Autowired`
- Controller 只做参数校验和调用 Service，业务逻辑放在 Service
- 用 DTO 接收请求数据，Entity 只用于数据库操作
:::
