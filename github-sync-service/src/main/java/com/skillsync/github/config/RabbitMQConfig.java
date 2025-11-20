package com.skillsync.github.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String GITHUB_EXCHANGE = "github.exchange";
    public static final String GITHUB_QUEUE = "github.queue";
    public static final String GITHUB_ROUTING_KEY = "github.#";

    @Bean
    public TopicExchange githubExchange() {
        return new TopicExchange(GITHUB_EXCHANGE);
    }

    @Bean
    public Queue githubQueue() {
        return QueueBuilder.durable(GITHUB_QUEUE)
                .withArgument("x-dead-letter-exchange", "github.dlx")
                .build();
    }

    @Bean
    public Binding githubBinding(Queue githubQueue, TopicExchange githubExchange) {
        return BindingBuilder.bind(githubQueue)
                .to(githubExchange)
                .with(GITHUB_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setConcurrentConsumers(3);
        factory.setMaxConcurrentConsumers(10);
        return factory;
    }
}