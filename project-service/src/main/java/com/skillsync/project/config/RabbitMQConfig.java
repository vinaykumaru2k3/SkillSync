package com.skillsync.project.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PROJECT_EXCHANGE = "project.exchange";
    public static final String PROJECT_QUEUE = "project.queue";
    public static final String PROJECT_ROUTING_KEY = "project.#";

    @Bean
    public TopicExchange projectExchange() {
        return new TopicExchange(PROJECT_EXCHANGE);
    }

    @Bean
    public Queue projectQueue() {
        return QueueBuilder.durable(PROJECT_QUEUE)
                .withArgument("x-dead-letter-exchange", "project.dlx")
                .build();
    }

    @Bean
    public Binding projectBinding(Queue projectQueue, TopicExchange projectExchange) {
        return BindingBuilder.bind(projectQueue)
                .to(projectExchange)
                .with(PROJECT_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, Jackson2JsonMessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }
}
